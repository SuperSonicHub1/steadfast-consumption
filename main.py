from steadfast_consumption import create_app

app = create_app()
app.run("0.0.0.0", 8080, load_dotenv=False)
