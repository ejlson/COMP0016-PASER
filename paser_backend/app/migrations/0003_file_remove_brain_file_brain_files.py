# Generated by Django 5.0.2 on 2024-03-05 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_brain_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(default='default/path/to/file', upload_to='brains/')),
            ],
        ),
        migrations.RemoveField(
            model_name='brain',
            name='file',
        ),
        migrations.AddField(
            model_name='brain',
            name='files',
            field=models.ManyToManyField(to='app.file'),
        ),
    ]
