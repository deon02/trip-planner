from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    # AI
    anthropic_api_key: str

    # Travel APIs
    openweathermap_api_key: str = ""
    opentripmap_api_key: str = ""
    aviationstack_api_key: str = ""
    rapidapi_key: str = ""
    mapbox_token: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # Cache (Phase 5)
    upstash_redis_url: str = ""
    upstash_redis_token: str = ""


settings = Settings()
