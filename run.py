from app import create_app

app = create_app()

if __name__ == "__main__":
    # debug=True gives auto-reload on file changes + detailed error pages.
    # We'll turn this off via config for production later.
    app.run(debug=True)
