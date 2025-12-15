import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# Sample categories
CATEGORIES = [
    {
        "name": "Health & Fitness",
        "description": "Physical health and exercise habits",
        "color": "#10b981",
        "icon": "fitness"
    },
    {
        "name": "Productivity",
        "description": "Work and productivity habits",
        "color": "#3b82f6",
        "icon": "productivity"
    },
    {
        "name": "Learning",
        "description": "Education and skill development",
        "color": "#8b5cf6",
        "icon": "book"
    },
    {
        "name": "Mindfulness",
        "description": "Mental health and meditation",
        "color": "#ec4899",
        "icon": "meditation"
    },
    {
        "name": "Social",
        "description": "Relationships and social activities",
        "color": "#f59e0b",
        "icon": "people"
    }
]


def register_user():
    """Register a test user"""
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    if response.status_code == 201:
        print("✓ User registered successfully")
        return True
    elif response.status_code == 400:
        print("✓ User already exists")
        return True
    else:
        print(f"✗ Failed to register user: {response.text}")
        return False


def login_user():
    """Login and get token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "testuser",
            "password": "testpass123"
        }
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✓ User logged in successfully")
        return token
    else:
        print(f"✗ Failed to login: {response.text}")
        return None


def create_categories(token):
    """Create sample categories"""
    headers = {"Authorization": f"Bearer {token}"}
    created = []
    
    for cat in CATEGORIES:
        response = requests.post(
            f"{BASE_URL}/categories",
            json=cat,
            headers=headers
        )
        if response.status_code == 201:
            created.append(response.json())
            print(f"✓ Created category: {cat['name']}")
        elif response.status_code == 400:
            # Category already exists, fetch it
            response = requests.get(f"{BASE_URL}/categories", headers=headers)
            existing = [c for c in response.json() if c['name'] == cat['name']]
            if existing:
                created.append(existing[0])
                print(f"✓ Category already exists: {cat['name']}")
    
    return created


def create_sample_habit(token, category_id):
    """Create a sample habit with logs"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create habit
    habit_response = requests.post(
        f"{BASE_URL}/habits",
        json={
            "name": "Morning Meditation",
            "goal": "Meditate for 10 minutes every morning",
            "category_id": category_id
        },
        headers=headers
    )
    
    if habit_response.status_code == 201:
        habit = habit_response.json()
        print(f"✓ Created habit: {habit['name']}")
        
        # Create logs for the past 15 days (with some gaps for streak testing)
        today = datetime.now()
        for i in range(15):
            date = today - timedelta(days=i)
            # Skip days 3, 4, and 8 to create streak breaks
            if i not in [3, 4, 8]:
                log_response = requests.post(
                    f"{BASE_URL}/habits/{habit['id']}/logs",
                    json={
                        "date": date.isoformat(),
                        "value": True,
                        "note": f"Meditation session on day {i}" if i % 3 == 0 else None
                    },
                    headers=headers
                )
                if log_response.status_code == 201:
                    print(f"  ✓ Created log for {date.date()}")
        
        return habit
    else:
        print(f"✗ Failed to create habit: {habit_response.text}")
        return None


def create_sample_goal(token, habit_id):
    """Create a sample goal"""
    headers = {"Authorization": f"Bearer {token}"}
    
    goal_response = requests.post(
        f"{BASE_URL}/goals",
        json={
            "habit_id": habit_id,
            "title": "30-Day Meditation Streak",
            "description": "Complete meditation for 30 consecutive days",
            "goal_type": "STREAK",
            "target_value": 30
        },
        headers=headers
    )
    
    if goal_response.status_code == 201:
        goal = goal_response.json()
        print(f"✓ Created goal: {goal['title']}")
        return goal
    else:
        print(f"✗ Failed to create goal: {goal_response.text}")
        return None


def test_streak_endpoint(token, habit_id):
    """Test streak calculation"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/streaks/{habit_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        stats = response.json()
        print(f"\n📊 Streak Statistics:")
        print(f"  Current Streak: {stats['current_streak']} days")
        print(f"  Longest Streak: {stats['longest_streak']} days")
        print(f"  Total Streaks: {stats['total_streaks']}")
        print(f"  Average Length: {stats['average_streak_length']} days")
        return True
    else:
        print(f"✗ Failed to get streak stats: {response.text}")
        return False


def test_goal_progress(token, goal_id):
    """Test goal progress calculation"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/goals/{goal_id}/progress",
        headers=headers
    )
    
    if response.status_code == 200:
        progress = response.json()
        print(f"\n🎯 Goal Progress:")
        print(f"  Current Value: {progress['current_value']}")
        print(f"  Target Value: {progress['goal']['target_value']}")
        print(f"  Progress: {progress['progress_percentage']}%")
        print(f"  Completed: {progress['is_completed']}")
        return True
    else:
        print(f"✗ Failed to get goal progress: {response.text}")
        return False


def main():
    """Run seed script"""
    print("🌱 Starting seed script...\n")
    
    # Register and login
    if not register_user():
        return
    
    token = login_user()
    if not token:
        return
    
    print()
    
    # Create categories
    categories = create_categories(token)
    if not categories:
        print("✗ No categories created")
        return
    
    print()
    
    # Create sample habit with mindfulness category
    mindfulness_cat = [c for c in categories if c['name'] == 'Mindfulness'][0]
    habit = create_sample_habit(token, mindfulness_cat['id'])
    if not habit:
        return
    
    print()
    
    # Create goal
    goal = create_sample_goal(token, habit['id'])
    if not goal:
        return
    
    print()
    
    # Test streak calculation
    test_streak_endpoint(token, habit['id'])
    
    # Test goal progress
    test_goal_progress(token, goal['id'])
    
    print("\n✅ Seed script completed successfully!")
    print(f"\n📝 You can now test the API at: {BASE_URL}/docs")


if __name__ == "__main__":
    main()
