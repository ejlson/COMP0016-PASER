import json
from app.models import Brain, File
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from app.serializers import BrainSerializer, FileSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.views.decorators.csrf import csrf_exempt
from .LLM.singleton import ChatSingleton

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView

class BrainDetailView(APIView):
    """
    Retrieve or update a brain instance.
    """
    parser_classes = (MultiPartParser, FormParser)  # Add this to handle multipart/form-data

    def get_object(self, pk):
        try:
            return Brain.objects.get(pk=pk)
        except Brain.DoesNotExist:
            return None  # Adjusted to return None for consistency with patch method

    def get(self, request, pk, format=None):
        brain = self.get_object(pk)
        if not brain:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BrainSerializer(brain)
        return Response(serializer.data)
    
    def delete(self, request, pk, format=None):
        brain = self.get_object(pk)
        if brain is not None:
            brain.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk, format=None):
        brain = self.get_object(pk)
        if not brain:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BrainSerializer(brain, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Handle file deletions
            files_to_delete = json.loads(request.data.get('filesToDelete', '[]'))
            File.objects.filter(id__in=files_to_delete).delete()

            # Process new file uploads
            for file in request.FILES.getlist('files'):
                File.objects.create(brain=brain, file=file)

            # Fetch the updated list of files associated with the brain
            updated_files = brain.files.all()  # Assuming a reverse relationship from Brain to File
            file_serializer = FileSerializer(updated_files, many=True)
            
            # Fetch the updated brain instance to include any changes
            updated_brain = Brain.objects.get(pk=pk)
            brain_serializer = BrainSerializer(updated_brain)
            # return Response({'brain': brain_serializer.data, 'files': file_serializer.data})
            brain.refresh_from_db()
            updated_serializer = BrainSerializer(brain)
            return Response(updated_serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_object(self, pk):
        try:
            return Brain.objects.get(pk=pk)
        except Brain.DoesNotExist:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)

class BrainUpdateView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get_object(self, pk):
        try:
            return Brain.objects.get(pk=pk)
        except Brain.DoesNotExist:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)


    def patch(self, request, *args, **kwargs):
        try:
            brain_id = self.kwargs.get('id')
            brain = Brain.objects.get(id=brain_id)
        except Brain.DoesNotExist:
            return Response({'error': 'Brain not found.'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            # Deserialize incoming data to brain
            serializer = BrainSerializer(brain, data=request.data, partial=True)
            if serializer.is_valid():
                brain_instance = serializer.save()
                
                # Handling file deletions
                files_to_delete = request.data.get('filesToDelete', [])
                if files_to_delete:
                    files_to_delete = json.loads(files_to_delete)
                    File.objects.filter(id__in=files_to_delete).delete()
                
                # Handling file uploads
                files = request.FILES.getlist('files')
                for file in files:
                    File.objects.create(brain=brain_instance, file=file)
                    
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class BrainCreateView(APIView):
    
#     def post(self, request, *args, **kwargs):
#         brain_serializer = BrainSerializer(data=request.data)

#         if brain_serializer.is_valid():
#             brain = brain_serializer.save()
#             brain_instance = brain_serializer.save()
            
#             for file in request.FILES.getlist('files'):
#             # Explicitly setting the file path
#                 path = 'brains/' + file.name  # Customize the path as needed
#                 file_instance = File(brain=brain_instance)
#                 file_instance.file.save(path, file, save=True)

#             files_data = []
#             files = request.FILES.getlist('files')
#             for file in files:
#                 # Assuming File model has `file` field that stores uploaded file
#                 file_instance = File.objects.create(brain=brain, file=file)
#                 files_data.append({
#                     "id": file_instance.id,
#                     "file": file_instance.file.url,  # Adjust based on how you access file URL
#                     "brain": brain.id
#                 })

#             response_data = {
#                 "id": brain.id,
#                 "name": brain.name,
#                 "description": brain.description,
#                 "files": files_data  # Include modified file data in response
#             }
            
#             print(files_data)

#             return Response(response_data, status=status.HTTP_201_CREATED)

#         return Response(brain_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.db import transaction

class BrainCreateView(APIView):
    """
    API view to create a new Brain instance along with associated files.
    """
    parser_classes = (MultiPartParser, FormParser)  # Allow the view to handle multipart/form-data

    def post(self, request, *args, **kwargs):
        with transaction.atomic():  # Use a transaction to ensure data integrity
            brain_serializer = BrainSerializer(data=request.data)
            if brain_serializer.is_valid():
                brain_instance = brain_serializer.save()  # Save the brain instance
                singleton = ChatSingleton()
                emb = singleton.embeddings
                # Handle file uploads
                files = request.FILES.getlist('files')
                for file in files:
                    File.objects.create(brain=brain_instance, file=file)  # Create a File instance for each uploaded file
                    emb.add_docs_to_index(f"media/brains/{file}", str(brain_instance))

                # Optionally, serialize and return the newly created brain instance, including file information
                brain_serializer = BrainSerializer(brain_instance)
                return Response(brain_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(brain_serializer.errors, status=status.HTTP_400_BAD_REQUEST)



def filemanager(request):
    return render(request, 'index.html')



# from .srcs.ChatbotEmbeddings import ChatBot

def index(request):
    return render(request, 'index.html')

class BrainViewSet(viewsets.ModelViewSet):
    queryset = Brain.objects.all()
    serializer_class = BrainSerializer
    parser_classes = (MultiPartParser, FormParser)

def brain_files(request, brain_id):
    brain = Brain.objects.get(id=brain_id)
    files = brain.files.all()
    return render(request, 'brain_files.html', {'brain': brain, 'files': files})

@api_view(['GET'])
def getBrainFiles(request, brain_id):
    if request.method == 'GET':
        files = File.objects.filter(brain_id=brain_id)
        files_data = [{'name': file.file.name, 'url': file.file.url} for file in files]
        return JsonResponse({'files': files_data})
        
@csrf_exempt
def upload_brain_file(request, brain_id):
    if request.method == 'POST':
        try:
            brain = Brain.objects.get(id=brain_id)
            for file in request.FILES.getlist('files'):
                File.objects.create(brain=brain, file=file)
            return JsonResponse({'message': 'Files uploaded successfully'}, status=200)
        except Brain.DoesNotExist:
            return JsonResponse({'error': 'Brain not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)        
        
@api_view(['POST'])
def update_brain(request, id):
    if request.method == 'POST':
        brain = Brain.objects.get(pk=id)
        brain.name = request.POST.get('name')
        brain.description = request.POST.get('description')
        brain.save()

        for file in request.FILES.getlist('files'):
            File.objects.create(brain=brain, file=file)

        files_to_delete = json.loads(request.POST.get('filesToDelete', '[]'))
        File.objects.filter(id__in=files_to_delete).delete()

        return JsonResponse({'message': 'Brain updated successfully'})

    return JsonResponse({'error': 'Invalid request'}, status=400)   

def handle_file_uploads(brain_instance, files):
    files_data = []
    for file in files:
        file_instance = File.objects.create(brain=brain_instance, file=file)
        files_data.append({
            "id": file_instance.id,
            "file": file_instance.file.url,  # Adjust as necessary
            "brain": brain_instance.id
        })
    return files_data     

@api_view(['GET', 'POST'])
def brains(request):
    
    if request.method == 'GET':
        data = Brain.objects.all()
        serializer = BrainSerializer(data, many=True)
        return Response({'brains': serializer.data})
    elif request.method == 'POST':
        serializer = BrainSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'brain': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# old one
# @api_view(['GET', 'POST', 'DELETE'])
# def brain(request, id):
    
#     try: 
#         data = Brain.objects.get(pk=id)
#     except Brain.DoesNotExist:
#         return Response(status=status.HTTP_404_NOT_FOUND)
    
#     if request.method == 'GET':
#         serializer = BrainSerializer(data)
#         return Response({'brain': serializer.data}, status=status.HTTP_200_OK)
#     elif request.method == 'DELETE':
#         data.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)
#     elif request.method == 'POST':
#         serializer = BrainSerializer(data, data=request.data)
#         #  fix this
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'brain': serializer.data}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#     serializer = BrainSerializer(data)
#     return Response({'brain': serializer.data}, status=status.HTTP_200_OK)

# new one
# @parser_classes((JSONParser, MultiPartParser, FormParser))

@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
def brain(request, id=None):
    if request.method == 'GET':
        try:
            data = Brain.objects.get(pk=id)
            serializer = BrainSerializer(data)
            return Response({'brain': serializer.data}, status=status.HTTP_200_OK)
        except Brain.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    elif request.method == 'PATCH':
        data = Brain.objects.get(pk=id)
        serializer = BrainSerializer(data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Handle file deletions
            files_to_delete = json.loads(request.data.get('filesToDelete', '[]'))
            File.objects.filter(id__in=files_to_delete).delete()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        try:
            data = Brain.objects.get(pk=id)
            data.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Brain.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        serializer = BrainSerializer(data=request.data)
        if serializer.is_valid():
            brain_instance = serializer.save()
            
            for file in request.FILES.getlist('files'):
            # Explicitly setting the file path
                path = 'brains/' + file.name  # Customize the path as needed
                file_instance = File(brain=brain_instance)
                file_instance.file.save(path, file, save=True)
                # Now file_instance.file.url should give you the correct URL
            
            # # Explicitly handle file uploads
            # files = request.FILES.getlist('files')
            # files_data = handle_file_uploads(brain_instance, files)
            
            # # Include file data in the response
            # response_data = serializer.data
            # response_data['files'] = files_data
            
            # files_data = []
            # files = request.FILES.getlist('files')
            # for file in files:
            #     # Assuming File model has `file` field that stores uploaded file
            #     file_instance = File.objects.create(brain=brain_instance, file=file)
            #     files_data.append({
            #         "id": file_instance.id,
            #         "file": file_instance.file.url,  # Adjust based on how you access file URL
            #         "brain": brain.id
            #     })
            # brain_data = serializer.data
            # brain_data['files'] = files_data
            # print(brain_data['files'])
            # Handle file uploads
            # files = request.FILES.getlist('files')
            # for file in files:
            #     File.objects.create(brain=brain_instance, file=file)
            
        #     return Response(BrainSerializer(brain_instance).data, status=status.HTTP_201_CREATED)
        # else:
        #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
def delete_file(request, file_id):
    if request.method == 'DELETE':
        try:
            file = File.objects.get(id=file_id)
            file.delete() # Deletes the file from the database and storage
            return JsonResponse({'message': 'File deleted successfully'}, status=200)
        except File.DoesNotExist:
            return JsonResponse({'error': 'File not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

# ====== for chatbot ======

def chat(request):
    # uncomment to clear the sessions saved data
    # request.session.clear()
    chat_history = request.session.get('chat_history', [])
    # recommendations = request.session.get('recommendations', [])
    if 'saved_answers' in request.session:
        total = request.session.get('saved_answers')
    else:
        total = 0
    return render(request, 'chatapp/chat.html', {'chat_history': chat_history})

@api_view(['POST'])
def chat_view(request):
    
    if 'chat_history' not in request.session:
        request.session['chat_history'] = []
    
    # # Load context and user answers from session
    # if 'context' in request.session:
    #     chatbot.context = request.session['context']
    # if 'saved_answers' in request.session:
    #     chatbot.saved_answers = request.session['saved_answers']

    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        user_message = data.get("message")
        # response = chatbot.interact(user_message)
        
        # uncomment below to run LLM, Might not run on your device due to dependencies
        singleton = ChatSingleton()
        chatbot = singleton.chatbot

        response = chatbot.query(user_message)

        # # Save context to session
        # request.session['context'] = chatbot.context

        # # Store chat messages in session
        # if 'chat_history' not in request.session:
        #     request.session['chat_history'] = []

        # request.session['chat_history'].append({
        #     'role': 'You',
        #     'message': user_message
        # })
        # request.session['chat_history'].append({
        #     'role': 'Brain', # Change form GenInvest to Brain
        #     'message': response
        # })
        # request.session.modified = True  # Ensure the session is saved

        # if "done" in user_message.lower():
        #     recommendations = chatbot.get_recommendations()

        #     request.session['saved_answers'] = chatbot.saved_answers

        #     request.session['chat_history'].append({
        #     'role': 'Brain', # Change form GenInvest to Brain
        #     'message': recommendations
        #     })            

        #     return JsonResponse({"response": recommendations})
        return JsonResponse({"response": response})
