import os
import re
import logging
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
allowed_origins = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',') if origin.strip()]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
app.logger.setLevel(logging.INFO)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'false').lower() == 'true'
INVALID_TOKEN_SENTINELS = {'', 'your_github_token_here', 'ghp_your_token_here'}
GITHUB_USERNAME_REGEX = re.compile(r'^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$')


def has_valid_token():
    token = (GITHUB_TOKEN or '').strip()
    return token not in INVALID_TOKEN_SENTINELS


def fetch_github_data(username):
    if not has_valid_token():
        if USE_MOCK_DATA:
            print('Warning: GITHUB_TOKEN not set. Falling back to mock data.')
            return get_mock_data(username), 'mock'
        raise RuntimeError('GITHUB_TOKEN is not configured. Set backend/.env before using live GitHub data.')

    headers = {
        'Authorization': f'bearer {GITHUB_TOKEN}',
        'Content-Type': 'application/json'
    }

    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
    """

    variables = {'login': username}
    response = requests.post(
        'https://api.github.com/graphql',
        json={'query': query, 'variables': variables},
        headers=headers,
        timeout=15
    )

    if response.status_code == 401:
        raise RuntimeError('Invalid GITHUB_TOKEN. Generate a new token and update backend/.env.')

    if response.status_code != 200:
        raise RuntimeError(f'Failed to fetch data from GitHub: {response.text}')

    return response.json(), 'github'


def get_mock_data(_username):
    weeks = []
    for _ in range(52):
        days = []
        for _ in range(7):
            days.append({
                'contributionCount': os.urandom(1)[0] % 10 if os.urandom(1)[0] % 3 == 0 else 0,
                'date': '2024-01-01'
            })
        weeks.append({'contributionDays': days})

    return {
        'data': {
            'user': {
                'contributionsCollection': {
                    'contributionCalendar': {
                        'totalContributions': sum([d['contributionCount'] for w in weeks for d in w['contributionDays']]),
                        'weeks': weeks
                    }
                }
            }
        }
    }


def analyze_tendencies(github_data, source):
    try:
        calendar = github_data['data']['user']['contributionsCollection']['contributionCalendar']
        total_commits = calendar['totalContributions']

        night_score = (total_commits * 17) % 50 + 50
        strategy_score = (total_commits * 13) % 50 + 50
        consistency_score = (total_commits * 19) % 50 + 50
        focus_score = (total_commits * 23) % 50 + 50

        types = ['Night Strategist', 'System Architect', 'Experimental Builder', 'Consistency Master', 'Lone Wolf']
        user_type = types[total_commits % len(types)]

        days = []
        for week in calendar['weeks']:
            for day in week['contributionDays']:
                days.append({
                    'date': day['date'],
                    'count': day['contributionCount']
                })

        return {
            'type': user_type,
            'scores': {
                'Strategy': strategy_score,
                'Consistency': consistency_score,
                'Focus Burst': focus_score,
                'Night Owl': night_score
            },
            'totalContributions': total_commits,
            'days': days,
            'dataSource': source
        }
    except Exception as exc:
        raise RuntimeError('Error analyzing data. User might not exist or data is malformed.') from exc


@app.route('/api/analyze/<username>', methods=['GET'])
def analyze(username):
    try:
        normalized_username = username.strip().lstrip('@')
        if not GITHUB_USERNAME_REGEX.match(normalized_username):
            return jsonify({'error': 'Invalid GitHub username format.'}), 400

        data, source = fetch_github_data(normalized_username)

        if data is None or 'errors' in data:
            message = data.get('errors', [{'message': 'GitHub API Error'}])[0].get('message')
            return jsonify({'error': message}), 400

        result = analyze_tendencies(data, source)
        return jsonify(result)

    except RuntimeError as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception as exc:
        app.logger.exception('Unexpected error during analyze request')
        return jsonify({'error': 'Internal server error. Please try again later.'}), 500


if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(port=5000, debug=debug_mode)
