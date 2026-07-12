class Config:
    """
    Central place for app-wide settings.

    Right now this is nearly empty on purpose — we're not adding a database,
    secret keys, or anything else until a milestone actually needs it.
    """
    CONTENT_DIR = "content"  # relative path to the content/ folder
