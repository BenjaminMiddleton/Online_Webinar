from config import Config

class ProductionConfig(Config):
    """Production configuration with debug disabled and stricter settings."""
    def __init__(self):
        super().__init__()
        self.DEBUG = False
        self.TESTING = False
        self.LOG_LEVEL = "WARNING"
