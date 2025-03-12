from backend.environment import Environment

if __name__ == "__main__":
    import json
    print(json.dumps(Environment.get_config_json(), indent=2))
