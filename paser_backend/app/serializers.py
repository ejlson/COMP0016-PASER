from rest_framework import serializers
from app.models import Brain, File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'

class BrainSerializer(serializers.ModelSerializer):
    
    files = FileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Brain
        fields = '__all__'
