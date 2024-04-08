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

    def create(self, validated_data):
        files_data = validated_data.pop('files', [])
        brain_instance = Brain.objects.create(**validated_data)
        if files_data:
            for file_data in files_data:
                File.objects.create(brain=brain_instance, file=file_data)
        
        return brain_instance
