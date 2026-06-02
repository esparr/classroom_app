from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "config"

    def ready(self):
        import dspy
        from django.conf import settings

        model = getattr(settings, "DSPY_MODEL", None)
        api_key = getattr(settings, "DSPY_API_KEY", None)

        if model and api_key:
            lm = dspy.LM(model=model, api_key=api_key)
            dspy.configure(lm=lm)
