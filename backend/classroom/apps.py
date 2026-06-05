from django.apps import AppConfig


class ClassroomConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "classroom"

    def ready(self):
        import dspy
        from django.conf import settings

        model = getattr(settings, "DSPY_MODEL", None)
        api_key = getattr(settings, "DSPY_API_KEY", None)
        api_base = getattr(settings, "DSPY_API_BASE", None)
        mlx_base_url = getattr(settings, "DSPY_MLX_BASE_URL", None)

        if mlx_base_url and model:
            lm = dspy.LM(model=model, api_base=mlx_base_url, api_key="mlx")
            dspy.configure(lm=lm)
        elif api_base and model:
            lm = dspy.LM(model=model, api_base=api_base, api_key="ollama")
            dspy.configure(lm=lm)
        elif model and api_key:
            lm = dspy.LM(model=model, api_key=api_key)
            dspy.configure(lm=lm)
