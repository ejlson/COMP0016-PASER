# Generated by Django 5.0.2 on 2024-03-05 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_file_remove_brain_file_brain_files'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='brain',
            name='files',
        ),
        migrations.AddField(
            model_name='brain',
            name='file',
            field=models.FileField(default='default/path/to/file', upload_to='brains/'),
        ),
        migrations.DeleteModel(
            name='File',
        ),
    ]
