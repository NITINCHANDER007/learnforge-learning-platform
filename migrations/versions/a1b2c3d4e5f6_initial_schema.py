"""Initial schema: users, progress, bookmarks, notes, lesson_notes

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-07-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)

    op.create_table('bookmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lesson_path', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'lesson_path', name='uq_user_lesson_bookmark')
    )
    with op.batch_alter_table('bookmarks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_bookmarks_user_id'), ['user_id'], unique=False)

    op.create_table('progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lesson_path', sa.String(length=255), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'lesson_path', name='uq_user_lesson_progress')
    )
    with op.batch_alter_table('progress', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_progress_user_id'), ['user_id'], unique=False)

    op.create_table('notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('attachment_path', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('notes', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_notes_user_id'), ['user_id'], unique=False)

    op.create_table('lesson_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lesson_path', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('attachment_path', sa.String(length=500), nullable=True),
        sa.Column('published', sa.Boolean(), nullable=False),
        sa.Column('pinned', sa.Boolean(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('lesson_notes', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_lesson_notes_lesson_path'), ['lesson_path'], unique=False)


def downgrade():
    op.drop_table('lesson_notes')
    with op.batch_alter_table('notes', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_notes_user_id'))
    op.drop_table('notes')
    with op.batch_alter_table('progress', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_progress_user_id'))
    op.drop_table('progress')
    with op.batch_alter_table('bookmarks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_bookmarks_user_id'))
    op.drop_table('bookmarks')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_email'))
    op.drop_table('users')
