"""empty message

Revision ID: 2d1f650dc096
Revises: 49d7a937f1a6
Create Date: 2014-04-06 23:49:26.532365

"""

# revision identifiers, used by Alembic.
revision = '2d1f650dc096'
down_revision = '49d7a937f1a6'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('videos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.Unicode(length=128), nullable=True),
    sa.Column('url', sa.String(length=64), nullable=True),
    sa.Column('views', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column(u'music', sa.Column('video_id', sa.Integer(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column(u'music', 'video_id')
    op.drop_table('videos')
    ### end Alembic commands ###