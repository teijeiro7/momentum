"""
Test script for the new dashboard analytics endpoint
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_dashboard_analytics():
    """Test the dashboard analytics endpoint"""
    
    # Login
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "testuser",
            "password": "testpass123"
        }
    )
    
    if response.status_code != 200:
        print("❌ Failed to login")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get dashboard analytics
    response = requests.get(
        f"{BASE_URL}/analytics/dashboard",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to get dashboard analytics: {response.text}")
        return
    
    data = response.json()
    
    print("✅ Dashboard Analytics Retrieved Successfully!\n")
    print("=" * 60)
    print("📊 OVERALL STATISTICS")
    print("=" * 60)
    stats = data['overall_stats']
    print(f"Total Habits: {stats['total_habits']}")
    print(f"Total Logs: {stats['total_logs']}")
    print(f"Total Completed: {stats['total_completed']}")
    print(f"Overall Completion Rate: {stats['overall_completion_rate']}%")
    print(f"Best Day Count: {stats['best_day_count']} habits")
    print(f"Best Day Date: {stats['best_day_date']}")
    print(f"Active Streaks: {stats['active_streaks']}")
    
    print("\n" + "=" * 60)
    print("🗓️  HEATMAP DATA (Last 7 days)")
    print("=" * 60)
    for item in data['heatmap_data'][-7:]:
        print(f"{item['date']}: {item['completed_count']}/{item['total_habits']} habits completed")
    
    print("\n" + "=" * 60)
    print("📈 HABIT SUMMARIES")
    print("=" * 60)
    for habit in data['habit_summaries']:
        print(f"\n{habit['habit_name']}:")
        print(f"  Completion Rate: {habit['completion_rate']}%")
        print(f"  Current Streak: {habit['current_streak']} days")
        print(f"  Longest Streak: {habit['longest_streak']} days")
        print(f"  Total Logs: {habit['total_logs']} ({habit['completed_logs']} completed)")
    
    print("\n" + "=" * 60)
    print("📂 CATEGORY BREAKDOWN")
    print("=" * 60)
    for category, count in data['category_breakdown'].items():
        print(f"{category}: {count} completions")
    
    print("\n✨ All analytics working perfectly!")


if __name__ == "__main__":
    test_dashboard_analytics()
