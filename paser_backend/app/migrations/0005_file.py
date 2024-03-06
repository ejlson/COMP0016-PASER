# Generated by Django 5.0.2 on 2024-03-05 02:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_remove_brain_files_brain_file_delete_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='brains/')),
                ('brain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='app.brain')),
            ],
        ),
    ]
