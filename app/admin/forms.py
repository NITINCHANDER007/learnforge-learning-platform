"""
admin/forms.py
"""

from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileField
from wtforms import BooleanField, SelectField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Email, Length

LESSON_MEDIA_TYPES = ["png", "jpg", "jpeg", "gif", "svg", "pdf", "zip", "mp4", "webm"]


class SubjectForm(FlaskForm):
    slug = StringField(
        "URL Slug",
        validators=[DataRequired(), Length(max=60)],
        description="Lowercase, hyphens only — e.g. 'javascript'. Cannot be changed later.",
    )
    title = StringField("Display Title", validators=[DataRequired(), Length(max=120)])
    submit = SubmitField("Create Subject")


class SectionForm(FlaskForm):
    title = StringField("Section Title", validators=[DataRequired(), Length(max=120)])
    submit = SubmitField("Create Section")


class LessonForm(FlaskForm):
    title = StringField("Lesson Title", validators=[DataRequired(), Length(max=200)])
    body = TextAreaField("Content (Markdown)", validators=[DataRequired()])
    media = FileField(
        "Attach image, file, or video (optional)",
        validators=[FileAllowed(LESSON_MEDIA_TYPES, "That file type isn't supported.")],
    )
    submit = SubmitField("Save Lesson")


class LessonNoteForm(FlaskForm):
    title = StringField("Note Title", validators=[DataRequired(), Length(max=200)])
    body = TextAreaField("Note (Markdown)", validators=[DataRequired()])
    attachment = FileField(
        "Attach image or file (optional)",
        validators=[FileAllowed(LESSON_MEDIA_TYPES, "That file type isn't supported.")],
    )
    pinned = BooleanField("Pin to top")
    published = BooleanField("Published (visible to everyone)", default=True)
    submit = SubmitField("Save Note")


class UserEditForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired(), Length(max=100)])
    email = StringField("Email", validators=[DataRequired(), Email(), Length(max=120)])
    role = SelectField(
        "Role",
        choices=[("student", "Student"), ("admin", "Admin")],
        validators=[DataRequired()],
    )
    is_active = BooleanField("Active Account")
    submit = SubmitField("Update User")


class MediaUploadForm(FlaskForm):
    media_file = FileField(
        "Select File",
        validators=[DataRequired(), FileAllowed(LESSON_MEDIA_TYPES, "That file type isn't supported.")],
    )
    submit = SubmitField("Upload Media")

