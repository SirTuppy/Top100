import json
import firebase_admin
from firebase_admin import credentials, firestore
import argparse
import logging
from datetime import datetime
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def parse_boulder(boulder_json):
    try:
        boulder = json.loads(boulder_json)
        if isinstance(boulder, list):
            boulder = boulder[0]  # Take the first item if it's a list
        
        return {
            "description": boulder.get("description", ""),
            "grade": boulder.get("grade", ""),
            "height": "Tall" if boulder.get("tall", False) else "Not tall",
            "landing": "Flat" if boulder.get("flatLanding", False) else "Not flat",
            "line": "Uncontrived" if boulder.get("uncontrived", False) else "Contrived",
            "location": boulder.get("location", ""),
            "name": boulder.get("name", ""),
            "rock": "Great" if boulder.get("greatRock", False) else "Not great",
            "start": "Obvious" if boulder.get("obviousStart", False) else "Not obvious"
        }
    except json.JSONDecodeError as e:
        logging.error(f"JSON Decode Error: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error in parse_boulder: {e}")
        return None

def process_boulders(file_path, dry_run=False):
    boulders = []
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        try:
            boulder_list = json.loads(content)
            if isinstance(boulder_list, list):
                for rank, boulder in enumerate(boulder_list, start=1):
                    parsed_boulder = parse_boulder(json.dumps(boulder))
                    if parsed_boulder:
                        parsed_boulder['rank'] = rank
                        parsed_boulder['id'] = str(rank)
                        boulders.append(parsed_boulder)
            else:
                logging.error("Expected a JSON array, but got a single object")
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing JSON file: {e}")
        except Exception as e:
            logging.error(f"Unexpected error processing boulders: {e}")
    return boulders

def update_firestore(boulders, dry_run=False):
    if dry_run:
        logging.info("Dry run: No changes will be made to the database.")
        return

    # Initialize Firebase app
    cred_path = r"C:\Projects\top100part2\boulder100\src\top100boulders-firebase-adminsdk-6ztf4-ae5bdafc12.json"
    if not os.path.exists(cred_path):
        logging.error(f"Firebase credentials file not found at: {cred_path}")
        return

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    # Create a new collection with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    collection_name = f"boulders_import_{timestamp}"
    boulders_ref = db.collection(collection_name)
    
    logging.info(f"Creating new collection: {collection_name}")
    
    # Add new boulders
    for boulder in boulders:
        doc_ref = boulders_ref.add(boulder)
        logging.info(f"Added boulder: {boulder['name']} with ID: {doc_ref[1].id}")

    logging.info(f"Import completed. New collection name: {collection_name}")

def main():
    parser = argparse.ArgumentParser(description="Process boulder data and update Firestore.")
    parser.add_argument("file_path", help="Path to the JSON file containing boulder data")
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without modifying the database")
    args = parser.parse_args()

    print(f"Received arguments: {args}")
    print(f"File path: {args.file_path}")

    logging.info(f"Processing file: {args.file_path}")
    boulders = process_boulders(args.file_path, args.dry_run)
    logging.info(f"Processed {len(boulders)} boulders")

    update_firestore(boulders, args.dry_run)
    logging.info("Process completed")

if __name__ == "__main__":
    main()