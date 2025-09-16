#!/usr/bin/env python3

import requests
import json
import io
import csv

# Base URL for the API
BASE_URL = "http://localhost:8001/api"

def test_root_endpoint():
    """Test the root endpoint"""
    print("Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_sample_data_endpoint():
    """Test the sample data endpoint"""
    print("\nTesting sample data endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/sample-data")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Number of sample datasets: {len(data)}")
            for sample in data:
                print(f"- {sample['name']}: {len(sample['data'])} rows, {len(sample['columns'])} columns")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def create_test_csv():
    """Create a test CSV in memory"""
    csv_content = """Name,Age,City,Salary
John,25,New York,50000
Jane,30,Los Angeles,60000
Bob,35,Chicago,55000
Alice,28,Houston,52000
Charlie,32,Phoenix,58000"""
    
    return io.StringIO(csv_content)

def test_csv_upload():
    """Test CSV upload endpoint"""
    print("\nTesting CSV upload...")
    try:
        # Create test CSV
        csv_data = create_test_csv()
        csv_content = csv_data.getvalue()
        
        files = {'file': ('test.csv', csv_content, 'text/csv')}
        response = requests.post(f"{BASE_URL}/upload-csv", files=files)
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Filename: {data['filename']}")
            print(f"Columns: {data['columns']}")
            print(f"Row count: {data['row_count']}")
            print(f"Sample data: {data['sample_data'][:2]}")
        else:
            print(f"Error response: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("Starting API tests...\n")
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Sample Data", test_sample_data_endpoint),
        ("CSV Upload", test_csv_upload),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
        print(f"{'✓' if result else '✗'} {test_name}")
    
    print(f"\nTest Summary:")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("❌ Some tests failed")

if __name__ == "__main__":
    main()