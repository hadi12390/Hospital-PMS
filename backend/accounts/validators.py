from django.core.exceptions import ValidationError
from PIL import Image


def validate_image_file(file):
    try:
        img = Image.open(file)
        img.verify()
    except Exception:
        raise ValidationError("Uploaded file is not a valid image.")

    file.seek(0)

    if img.format not in ('JPEG', 'PNG', 'WEBP'):
        raise ValidationError("Only JPEG, PNG, or WEBP images are allowed.")


def validate_avatar_size(file):
    max_size_mb = 2
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image must be under {max_size_mb}MB.")
