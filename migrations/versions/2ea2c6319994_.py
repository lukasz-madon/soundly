"""empty message

Revision ID: 2ea2c6319994
Revises: 12e23721e75f
Create Date: 2014-04-02 14:45:37.716001

"""

# revision identifiers, used by Alembic.
revision = '2ea2c6319994'
down_revision = '12e23721e75f'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('music', sa.Column('artist', sa.Unicode(length=128), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('music', 'artist')
    ### end Alembic commands ###
