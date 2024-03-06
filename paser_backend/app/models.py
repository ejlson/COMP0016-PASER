from django.db import models
from django.utils.deconstruct import deconstructible

@deconstructible
class UploadToPathAndRename(object):
    def __init__(self, path):
        self.sub_path = path

    def __call__(self, instance, filename):
        # Get the brain ID from the instance
        brain_id = instance.brain.id
        # Define the format for the file's new path and name
        format = self.sub_path + '{id}/{file}'
        # Build the path
        return format.format(id=brain_id, file=filename)

class File(models.Model):
    file = models.FileField(upload_to=UploadToPathAndRename('brains/'))
    brain = models.ForeignKey('Brain', related_name='files', on_delete=models.CASCADE)

class Brain(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=400)
    
    def __str__(self):
        return self.name
        # return str(self.file)
    