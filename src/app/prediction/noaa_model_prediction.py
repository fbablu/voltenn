# -*- coding: utf-8 -*-
"""noaa_model_prediction.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1ReaS4DVcn2Sq6XHaI1LbPR5Q5QXoxOvw
"""
# Commented out IPython magic to ensure Python compatibility.
# %cd /content/gdrive/MyDrive/2025_GDG_Solutions/model
# %ls
# from google.colab import drive
# drive.mount('/content/gdrive/', force_remount=True)


# src/model/outage_prediction_model.ipynb
# Power outage prediction model using TensorFlow Decision Forests and weather data

import pandas as pd
import numpy as np
import tensorflow as tf
import tensorflow_decision_forests as tfdf
from tensorflow import keras
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import requests
import json
from datetime import datetime, timedelta
import os
from google.cloud import storage
from google.cloud import aiplatform

# Set up Google Cloud Authentication
# Uncomment to use service account
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

# Create directories for model artifacts
# !mkdir -p /content/drive/MyDrive/2025_GDG_Solutions/model/models
# !mkdir -p /content/drive/MyDrive/2025_GDG_Solutions/model/data

# 1. NOAA Weather API Functions
def fetch_noaa_weather(lat, lng, start_date=None, end_date=None):
    """
    Fetch weather data from NOAA API for a specific location

    Args:
        lat (float): Latitude
        lng (float): Longitude
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format

    Returns:
        dict: Weather data from NOAA API
    """

    # 0.0: Using API with appropriate identifying info
    headers = {
        'User-Agent': '(gemicast-project, fardeen.e.bablu@vanderbilt.edu)',
        'Accept': 'application/geo+json',
    }

    # 1.0: Get metadata for this point to find grid coordinates
    point_url = f"https://api.weather.gov/points/{lat},{lng}"

    try:
      # 1.1: Send request
      response = requests.get(point_url, headers=headers)
      response.raise_for_status()
      point_data = response.json()

      # 1.2: Extract grid info
      grid_id = point_data['properties']['gridId']
      grid_x = point_data['properties']['gridX']
      grid_y = point_data['properties']['gridY']

      # 1.3: Get forecast data
      forecast_url = f"https://api.weather.gov/gridpoints/{grid_id}/{grid_x},{grid_y}"
      if start_date and end_date:
          forecast_url += f"?start={start_date}&endDateTIme={end_date}"

      # 1.4: Store forecast data
      foreceast_response = requests.get(forecast_url, headers=headers)
      foreceast_response.raise_for_status()
      forecast_data = foreceast_response.json()

      return forecast_data

    except requests.exceptions.RequestException as err:
      print(f"Error fetching weather data: {err}")
      return None


def extract_weather_features(noaa_data):
    """
    Extract relevant weather features from NOAA API response

    Args:
        noaa_data (dict): NOAA API response

    Returns:
        pd.DataFrame: DataFrame with weather features
    """
    if not noaa_data or 'properties' not in noaa_data:
        return pd.DataFrame()

    records = []
    props = noaa_data['properties']

    # Define the weather properties we're interested in
    weather_properties = [
        "temperature",
        "dewpoint",
        "maxTemperature",
        "minTemperature",
        "relativeHumidity",
        "apparentTemperature",
        "heatIndex",
        "windChill",
        "wetBulbGlobeTemperature",
        "skyCover",
        "windDirection",
        "windSpeed",
        "windGust",
        "weather",
        "hazards",  # Watch and advisory products in effect
        "probabilityOfPrecipitation",
        "quantitativePrecipitation",
        "iceAccumulation",
        "snowfallAmount",
        "snowLevel",
        "ceilingHeight",
        "visibility",
        "transportWindSpeed",
        "transportWindDirection",
        "mixingHeight",
        "hainesIndex",
        "lightningActivityLevel",
        "twentyFootWindSpeed",
        "twentyFootWindDirection",
        "waveHeight",
        "wavePeriod",
        "waveDirection",
        "primarySwellHeight",
        "primarySwellDirection",
        "secondarySwellHeight",
        "secondarySwellDirection",
        "wavePeriod2",
        "windWaveHeight",
        "dispersionIndex",
        "pressure",  # Barometric pressure
        "probabilityOfTropicalStormWinds",
        "probabilityOfHurricaneWinds",
        "potentialOf15mphWinds",
        "potentialOf25mphWinds",
        "potentialOf35mphWinds",
        "potentialOf45mphWinds",
        "potentialOf20mphWindGusts",
        "potentialOf30mphWindGusts",
        "potentialOf40mphWindGusts",
        "potentialOf50mphWindGusts",
        "potentialOf60mphWindGusts",
        "grasslandFireDangerIndex",
        "probabilityOfThunder",
        "davisStabilityIndex",
        "atmosphericDispersionIndex",
        "lowVisibilityOccurrenceRiskIndex",
        "stability",
        "redFlagThreatIndex"
    ]



    # Extract time series data for each property
    for prop in weather_properties:
        if prop in props:
            for entry in props[prop]['values']:
                valid_time = entry['validTime']


                # https://www.w3.org/TR/NOTE-datetime
                # 1994-11-05T08:15:30-05:00
                # November 5, 1994, 8:15:30 am, US Eastern Standard Time.

                time_parts = valid_time.split('T')
                date_part = time_parts[0]
                time_part = time_parts[1].split('-')[0] if '-' in time_parts[1] else time_parts[1].split('+')[0]

                # Combine date and time parts
                datetime_str = f"{date_part} {time_part}"

                # Convert to datetime
                try:
                    dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    # Try alternative format if the first one fails
                    dt = datetime.strptime(f"{date_part} {time_part}", '%Y-%m-%d %H:%M:%S')

                # Create record
                record = {
                    'timestamp': dt,
                    'property': prop,
                    'value': entry['value']
                }
                records.append(record)

    # Create DataFrame
    df = pd.DataFrame(records)

    # Pivot to create wide format
    if not df.empty:
        df_pivot = df.pivot_table(
            index='timestamp',
            columns='property',
            values='value',
            aggfunc='first'
        ).reset_index()
        return df_pivot

    return pd.DataFrame()


def fetch_historical_weather(locations, start_date, end_date):
    """
    Fetch historical weather data for multiple locations

    Args:
        locations (list): List of (lat, lng, location_name) tuples
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format

    Returns:
        pd.DataFrame: Combined weather data for all locations
    """
    all_data = []

    for lat, lng, location_name in locations:
        print(f"Fetching weather data for {location_name}...")
        noaa_data = fetch_noaa_weather(lat, lng, start_date, end_date)

        if noaa_data:
            weather_df = extract_weather_features(noaa_data)
            if not weather_df.empty:
                weather_df['location'] = location_name
                weather_df['latitude'] = lat
                weather_df['longitude'] = lng
                all_data.append(weather_df)

    if all_data:
        return pd.concat(all_data, ignore_index=True)
    else:
        return pd.DataFrame()

# 2. Synthetic Data Generation
def generate_synthetic_grid_data(num_locations=50):
    """
    Generate synthetic grid infrastructure data

    Args:
        num_locations (int): Number of locations to generate

    Returns:
        pd.DataFrame: Synthetic grid data
    """
    # Define location centers (major cities in the US)
    city_centers = [
        (36.1627, -86.7816, "Nashville, TN"),
        (33.7490, -84.3880, "Atlanta, GA"),
        (29.7604, -95.3698, "Houston, TX"),
        (39.9526, -75.1652, "Philadelphia, PA"),
        (41.8781, -87.6298, "Chicago, IL")
    ]

    # Generate locations around these centers
    np.random.seed(42)
    grid_data = []

    for center_lat, center_lng, city in city_centers:
        for _ in range(num_locations // len(city_centers)):
            # Generate random offsets (within ~10 miles)
            lat_offset = np.random.normal(0, 0.05)
            lng_offset = np.random.normal(0, 0.05)

            lat = center_lat + lat_offset
            lng = center_lng + lng_offset

            # Generate infrastructure data
            infra_type = np.random.choice(['overhead', 'underground'], p=[0.7, 0.3])
            age = np.random.randint(1, 40)  # Age in years

            # Condition degrades with age, with some randomness
            condition_score = max(1, min(10, 10 - age/4 + np.random.normal(0, 1)))
            if condition_score >= 8:
                condition = 'excellent'
            elif condition_score >= 6:
                condition = 'good'
            elif condition_score >= 4:
                condition = 'fair'
            else:
                condition = 'poor'

            # Maintenance is more recent for better condition
            days_since_maintenance = int(365 * (1 + (10 - condition_score) / 3))
            last_maintenance = (datetime.now() - timedelta(days=days_since_maintenance)).strftime('%Y-%m-%d')

            # Vulnerabilities based on type and condition
            vulnerabilities = []
            if infra_type == 'overhead':
                if np.random.random() < 0.7:
                    vulnerabilities.append('tree coverage')
                if np.random.random() < 0.5:
                    vulnerabilities.append('wind exposure')
            else:  # underground
                if np.random.random() < 0.4:
                    vulnerabilities.append('flood zone')
                if np.random.random() < 0.3:
                    vulnerabilities.append('construction areas')

            if condition in ['fair', 'poor']:
                vulnerabilities.append('aging equipment')

            # Historical outages are more likely with older, poorer condition infrastructure
            outage_risk_factor = (age / 40) * (1 - condition_score / 10)
            past_outages = np.random.poisson(outage_risk_factor * 10)

            # Average repair time increases with poor condition
            avg_repair_time = int(60 + (120 * (1 - condition_score / 10)))

            # Common causes based on type and vulnerabilities
            causes = []
            if 'tree coverage' in vulnerabilities or 'wind exposure' in vulnerabilities:
                causes.append('weather')
            if 'aging equipment' in vulnerabilities:
                causes.append('equipment failure')
            if 'flood zone' in vulnerabilities:
                causes.append('flooding')
            if 'construction areas' in vulnerabilities:
                causes.append('construction damage')
            if not causes:
                causes.append('unknown')

            grid_data.append({
                'location_id': f"{city.split(',')[0].upper()}{np.random.randint(1000, 9999)}",
                'latitude': lat,
                'longitude': lng,
                'city': city.split(',')[0],
                'state': city.split(',')[1].strip(),
                'infrastructure_type': infra_type,
                'age_years': age,
                'condition': condition,
                'last_maintenance': last_maintenance,
                'vulnerabilities': ','.join(vulnerabilities),
                'past_outages': past_outages,
                'avg_repair_minutes': avg_repair_time,
                'common_causes': ','.join(causes)
            })

    return pd.DataFrame(grid_data)

def generate_synthetic_outage_data(grid_df, start_date_str='2023-01-01', end_date_str='2023-12-31'):
    """
    Generate synthetic outage data based on grid infrastructure

    Args:
        grid_df (pd.DataFrame): Grid infrastructure data
        start_date_str (str): Start date in YYYY-MM-DD format
        end_date_str (str): End date in YYYY-MM-DD format

    Returns:
        pd.DataFrame: Synthetic outage data
    """
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    days_range = (end_date - start_date).days

    # Weather severity by month (simplified seasonal patterns)
    # Higher values mean more severe weather
    weather_severity_by_month = {
        1: 0.8,  # January - winter storms
        2: 0.7,  # February
        3: 0.6,  # March
        4: 0.5,  # April - spring storms
        5: 0.6,  # May
        6: 0.7,  # June - summer storms
        7: 0.8,  # July
        8: 0.7,  # August - hurricane season
        9: 0.6,  # September
        10: 0.4, # October
        11: 0.5, # November
        12: 0.7, # December - winter storms
    }

    outages = []

    for _, row in grid_df.iterrows():
        # Calculate base outage probability based on infrastructure
        if row['condition'] == 'excellent':
            base_prob = 0.02
        elif row['condition'] == 'good':
            base_prob = 0.05
        elif row['condition'] == 'fair':
            base_prob = 0.10
        else:  # poor
            base_prob = 0.20

        # Adjust based on age
        age_factor = min(1.0, row['age_years'] / 40)

        # Consider type factor
        type_factor = 1.2 if row['infrastructure_type'] == 'overhead' else 0.7

        # Generate random outages throughout the year
        current_date = start_date
        while current_date <= end_date:
            # Adjust probability based on month's weather severity
            month_factor = weather_severity_by_month[current_date.month]

            # Final probability calculation
            daily_prob = base_prob * age_factor * type_factor * month_factor

            # Check if outage occurs
            if np.random.random() < daily_prob:
                # Generate outage duration
                if 'equipment failure' in row['common_causes']:
                    duration_hours = np.random.gamma(shape=2.0, scale=row['avg_repair_minutes']/60/2)
                else:
                    duration_hours = np.random.gamma(shape=1.5, scale=row['avg_repair_minutes']/60/1.5)

                # Cap at reasonable values
                duration_hours = min(duration_hours, 72)  # Max 3 days

                # Create random start time during the day
                start_hour = np.random.randint(0, 24)
                start_time = current_date.replace(hour=start_hour)

                # Calculate end time
                end_time = start_time + timedelta(hours=duration_hours)

                # Determine cause
                cause_options = row['common_causes'].split(',')
                cause = np.random.choice(cause_options)

                # Weather conditions (simplistic)
                if cause == 'weather':
                    if current_date.month in [12, 1, 2]:  # Winter
                        weather_type = np.random.choice(['snow', 'ice', 'freezing rain'])
                        temp = np.random.uniform(-10, 5)  # Cold temps
                    elif current_date.month in [6, 7, 8]:  # Summer
                        weather_type = np.random.choice(['thunderstorm', 'high winds', 'heat'])
                        temp = np.random.uniform(25, 35)  # Hot temps
                    else:  # Spring/Fall
                        weather_type = np.random.choice(['rain', 'wind', 'thunderstorm'])
                        temp = np.random.uniform(10, 25)  # Moderate temps

                    wind_speed = np.random.gamma(2, 10) if 'wind' in weather_type else np.random.gamma(1, 5)
                    precipitation = np.random.gamma(2, 10) if any(w in weather_type for w in ['rain', 'snow']) else 0
                else:
                    # Non-weather causes, generate moderate weather
                    weather_type = 'clear'
                    if current_date.month in [12, 1, 2]:  # Winter
                        temp = np.random.uniform(-5, 10)
                    elif current_date.month in [6, 7, 8]:  # Summer
                        temp = np.random.uniform(20, 30)
                    else:  # Spring/Fall
                        temp = np.random.uniform(5, 25)

                    wind_speed = np.random.gamma(1, 3)
                    precipitation = 0

                # Calculate affected customers based on area and outage severity
                base_customers = np.random.poisson(500)  # Base number
                severity_factor = duration_hours / 8  # Longer outages tend to affect more people
                affected_customers = int(base_customers * severity_factor)

                outages.append({
                    'outage_id': f"OUT-{len(outages) + 1:05d}",
                    'location_id': row['location_id'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'city': row['city'],
                    'state': row['state'],
                    'start_time': start_time,
                    'end_time': end_time,
                    'duration_hours': duration_hours,
                    'affected_customers': affected_customers,
                    'cause': cause,
                    'infrastructure_type': row['infrastructure_type'],
                    'infrastructure_condition': row['condition'],
                    'infrastructure_age': row['age_years'],
                    'weather_temp_celsius': temp,
                    'weather_wind_speed_kph': wind_speed,
                    'weather_precipitation_mm': precipitation,
                    'weather_type': weather_type
                })

            # Move to next day
            current_date += timedelta(days=1)

    return pd.DataFrame(outages)

# 3. Feature Engineering
def prepare_features(outages_df, grid_df, weather_df=None):
    """
    Prepare features for the prediction model with fix for boolean columns

    Args:
        outages_df (pd.DataFrame): Historical outage data
        grid_df (pd.DataFrame): Grid infrastructure data
        weather_df (pd.DataFrame, optional): Weather data

    Returns:
        tuple: X (features) and y (labels) for model training
    """
    # Combine data
    combined_data = outages_df.copy()

    # Create binary target variable (1 = outage occurred)
    combined_data['outage_occurred'] = 1

    # Create additional features
    combined_data['month'] = pd.to_datetime(combined_data['start_time']).dt.month
    combined_data['day_of_week'] = pd.to_datetime(combined_data['start_time']).dt.dayofweek
    combined_data['hour_of_day'] = pd.to_datetime(combined_data['start_time']).dt.hour

    # One-hot encode categorical variables
    categorical_cols = [
        'cause', 'infrastructure_type', 'infrastructure_condition',
        'weather_type', 'city', 'state'
    ]

    # Only include columns that actually exist in the dataset
    categorical_cols = [col for col in categorical_cols if col in combined_data.columns]

    for col in categorical_cols:
        combined_data[col] = combined_data[col].astype(str)

    for col in categorical_cols:
        dummies = pd.get_dummies(combined_data[col], prefix=col, dummy_na=False)
        # Use column names that are simpler and more TF-friendly
        dummies.columns = [col_name.replace(" ", "_").replace("-", "_").lower() for col_name in dummies.columns]
        combined_data = pd.concat([combined_data, dummies], axis=1)

    # Generate negative examples (non-outage events)
    non_outages = []

    for idx, outage in combined_data.iterrows():
        non_outage = outage.copy()

        # Shift time by a random amount (1-30 days)
        day_shift = np.random.randint(1, 30)
        shift_direction = 1 if np.random.random() > 0.5 else -1

        # Make sure we're working with datetime objects
        if isinstance(non_outage['start_time'], str):
            non_outage_time = datetime.strptime(non_outage['start_time'], '%Y-%m-%d %H:%M:%S')
        else:
            non_outage_time = non_outage['start_time']

        non_outage_time = non_outage_time + timedelta(days=day_shift * shift_direction)
        non_outage['start_time'] = non_outage_time

        # Update derived time features
        non_outage['month'] = non_outage_time.month
        non_outage['day_of_week'] = non_outage_time.weekday()
        non_outage['hour_of_day'] = non_outage_time.hour

        # Lower the severity of weather conditions
        if 'weather_wind_speed_kph' in non_outage:
            non_outage['weather_wind_speed_kph'] *= 0.6
        if 'weather_precipitation_mm' in non_outage:
            non_outage['weather_precipitation_mm'] *= 0.4

        # Set target to 0 (no outage)
        non_outage['outage_occurred'] = 0

        non_outages.append(non_outage)

    # Combine outage and non-outage data
    if non_outages:
        non_outages_df = pd.DataFrame(non_outages)
        all_data = pd.concat([combined_data, non_outages_df], ignore_index=True)
    else:
        all_data = combined_data

    # Select features and target
    feature_cols = [
        'month', 'day_of_week', 'hour_of_day',
        'infrastructure_age', 'weather_temp_celsius',
        'weather_wind_speed_kph', 'weather_precipitation_mm'
    ]

    # Only include columns that actually exist in the dataset
    feature_cols = [col for col in feature_cols if col in all_data.columns]

    # Add dummy columns (one-hot encoded categories)
    # Filtering to make sure we only include columns that exist
    dummy_prefixes = ['cause_', 'infrastructure_type_', 'infrastructure_condition_',
                    'weather_type_', 'city_', 'state_']

    dummy_cols = [col for col in all_data.columns if any(col.startswith(prefix.lower()) for prefix in dummy_prefixes)]

    feature_cols.extend(dummy_cols)

    # Make sure all feature columns exist in the dataset
    feature_cols = [col for col in feature_cols if col in all_data.columns]

    # Create X and y for model training (use copy to avoid SettingWithCopyWarning)
    X = all_data[feature_cols].copy()
    y = all_data['outage_occurred'].copy()

    for col in X.columns:
        if X[col].dtype == bool:
            X.loc[:, col] = X[col].astype(int)

    return X, y


# 4. Model Building with TensorFlow Decision Forests
def build_and_train_model(X_train, y_train, X_test, y_test):
    """
    Build and train a TensorFlow Decision Forests model

    Args:
        X_train (pd.DataFrame): Training features
        y_train (pd.Series): Training labels
        X_test (pd.DataFrame): Testing features
        y_test (pd.Series): Testing labels

    Returns:
        tuple: Trained model and training history
    """
    # Convert pandas DataFrames to numpy arrays to avoid hashing issues
    X_train_np = X_train.to_numpy()
    y_train_np = y_train.to_numpy()
    X_test_np = X_test.to_numpy()
    y_test_np = y_test.to_numpy()

    # Create feature names list
    feature_names = list(X_train.columns)

    # Create TF Datasets with batch operation
    train_ds = tf.data.Dataset.from_tensor_slices((
        {name: X_train[name].values for name in X_train.columns},
        y_train.values
    )).batch(32)

    test_ds = tf.data.Dataset.from_tensor_slices((
        {name: X_test[name].values for name in X_test.columns},
        y_test.values
    )).batch(32)

    # Define model
    model = tfdf.keras.RandomForestModel(
        verbose=2,
        task=tfdf.keras.Task.CLASSIFICATION,
        num_trees=200,
        categorical_algorithm='CART',
        random_seed=42
    )

    # Compile model
    model.compile(metrics=['accuracy'])

    # Train model
    history = model.fit(train_ds, validation_data=test_ds)

    return model, history


# 5. Model Evaluation
def evaluate_model(model, X_test, y_test):
    """
    Evaluate the trained model

    Args:
        model: Trained TensorFlow model
        X_test (pd.DataFrame): Testing features
        y_test (pd.Series): Testing labels

    Returns:
        dict: Evaluation metrics
    """
    # Convert data to TensorFlow dataset format
    test_ds = tfdf.keras.pd_dataframe_to_tf_dataset(X_test, label=y_test)

    # Evaluate model
    evaluation = model.evaluate(test_ds, return_dict=True)

    # Get predictions
    y_pred_proba = model.predict(test_ds)
    y_pred = (y_pred_proba > 0.5).astype(int).flatten()

    # Calculate metrics
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred, output_dict=True)

    # Calculate feature importance
    importance = model.make_inspector().variable_importances()

    # Display results
    print("Model Evaluation:")
    print(f"Accuracy: {evaluation['accuracy']:.4f}")
    print("\nConfusion Matrix:")
    print(conf_matrix)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
                xticklabels=['No Outage', 'Outage'],
                yticklabels=['No Outage', 'Outage'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.show()

    # Plot feature importance
    if importance:
        imp_df = pd.DataFrame({
            'Feature': importance["MEAN_DECREASE_IN_ACCURACY"][0]["features"],
            'Importance': importance["MEAN_DECREASE_IN_ACCURACY"][0]["importances"]
        })
        imp_df = imp_df.sort_values('Importance', ascending=False).head(15)

        plt.figure(figsize=(10, 8))
        sns.barplot(x='Importance', y='Feature', data=imp_df)
        plt.title('Feature Importance')
        plt.tight_layout()
        plt.show()

    return {
        'evaluation': evaluation,
        'confusion_matrix': conf_matrix,
        'classification_report': class_report,
        'feature_importance': importance
    }

# 6. Save and Deploy Model
def save_model(model, model_dir, version='v1'):
    """
    Save the trained model

    Args:
        model: Trained TensorFlow model
        model_dir (str): Directory to save the model
        version (str): Model version

    Returns:
        str: Path to saved model
    """
    save_path = os.path.join(model_dir, version)
    model.save(save_path)
    print(f"Model saved to {save_path}")
    return save_path

def deploy_to_vertex_ai(model_path, project_id, region, model_name, version='v1'):
    """
    Deploy model to Google Vertex AI

    Args:
        model_path (str): Path to saved model
        project_id (str): Google Cloud project ID
        region (str): Google Cloud region
        model_name (str): Name for the deployed model
        version (str): Model version

    Returns:
        str: Endpoint URL for the deployed model
    """
    # Initialize Vertex AI client
    aiplatform.init(project=project_id, location=region)

    # Upload model to Vertex AI Model Registry
    model = aiplatform.Model.upload(
        display_name=f"{model_name}-{version}",
        artifact_uri=model_path,
        serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-cpu.2-8:latest"
    )

    # Deploy model to endpoint
    endpoint = model.deploy(
        machine_type="n1-standard-2",
        min_replica_count=1,
        max_replica_count=1
    )

    print(f"Model deployed to endpoint: {endpoint.resource_name}")
    return endpoint.resource_name

# 7. Main Execution Flow
def main():
    """
    Main execution function for model development with fixed boolean issue
    """
    # Generate synthetic grid infrastructure data
    print("Generating synthetic grid data...")
    grid_df = generate_synthetic_grid_data(num_locations=50)
    print(f"Generated grid data for {len(grid_df)} locations")

    # Generate synthetic outage data
    print("Generating synthetic outage data...")
    outages_df = generate_synthetic_outage_data(grid_df)
    print(f"Generated {len(outages_df)} synthetic outage records")

    # Prepare features using the fixed function
    print("Preparing model features...")
    X, y = prepare_features(outages_df, grid_df)

    # Split data for training and testing
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Build and train model using the fixed function
    print("Building and training TensorFlow Decision Forests model...")
    model, history = build_and_train_model(X_train, y_train, X_test, y_test)

    # Evaluate model
    print("Evaluating model performance...")
    test_ds = tf.data.Dataset.from_tensor_slices((
        {name: X_test[name].values for name in X_test.columns},
        y_test.values
    )).batch(32)

    evaluation = model.evaluate(test_ds, return_dict=True)
    print(f"Model accuracy: {evaluation['accuracy']:.4f}")

    # Save model
    model_dir = 'sample_model'
    os.makedirs(model_dir, exist_ok=True)
    save_path = os.path.join(model_dir, 'outage_prediction_model')
    model.save(save_path)
    print(f"Model saved to {save_path}")

    return model, save_path, evaluation

# Execute main function if run directly
if __name__ == "__main__":
    main()