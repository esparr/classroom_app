import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


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
            if not _server_reachable(mlx_base_url):
                logger.warning("MLX server at %s is not reachable — DSPy will not be configured. AI features will be unavailable.", mlx_base_url)
                return
            lm = dspy.LM(model=model, api_base=mlx_base_url, api_key="mlx")
            dspy.configure(lm=lm)
        elif api_base and model:
            if not _server_reachable(api_base):
                logger.warning("Ollama server at %s is not reachable — DSPy will not be configured. AI features will be unavailable.", api_base)
                return
            lm = dspy.LM(model=model, api_base=api_base, api_key="ollama")
            dspy.configure(lm=lm)
        elif model and api_key:
            lm = dspy.LM(model=model, api_key=api_key)
            dspy.configure(lm=lm)


def _server_reachable(base_url: str) -> bool:
    import urllib.request
    import urllib.error
    try:
        urllib.request.urlopen(base_url, timeout=3)
        return True
    except urllib.error.HTTPError:
        return True  # HTTP error means the server is up but rejected the request
    except Exception:
        return False
