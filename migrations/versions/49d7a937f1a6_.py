"""empty message

Revision ID: 49d7a937f1a6
Revises: 377217156942
Create Date: 2014-04-03 22:23:52.298326

"""

# revision identifiers, used by Alembic.
revision = '49d7a937f1a6'
down_revision = '377217156942'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('role', sa.SmallInteger(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'role')
    ### end Alembic commands ###
