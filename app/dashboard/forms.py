"""
dashboard/forms.py
"""

from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileField
from wtforms import PasswordField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError

from app.models.user import User

ALLOWED_ATTACHMENT_TYPES = ["pdf", "png", "jpg", "jpeg", "gif", "txt", "docx", "zip"]


class ProfileForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired(), Length(min=2, max=120)])
    email = StringField("Email", validators=[DataRequired(), Email()])
    submit = SubmitField("Save Changes")

    def __init__(self, current_user_id, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._current_user_id = current_user_id

    def validate_email(self, field):
        existing = User.query.filter_by(email=field.data.lower().strip()).first()
        if existing and existing.id != self._current_user_id:
            raise ValidationError("That email is already in use by another account.")


class ChangePasswordForm(FlaskForm):
    current_password = PasswordField("Current Password", validators=[DataRequired()])
    new_password = PasswordField("New Password", validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField(
        "Confirm New Password",
        validators=[DataRequired(), EqualTo("new_password", message="Passwords must match.")],
    )
    submit = SubmitField("Change Password")


class NoteForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired(), Length(max=200)])
    body = TextAreaField("Notes", validators=[DataRequired()])
    attachment = FileField(
        "Attachment (optional)",
        validators=[FileAllowed(ALLOWED_ATTACHMENT_TYPES, "That file type isn't supported.")],
    )
    submit = SubmitField("Save Note")
