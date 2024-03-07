import json
from app.models import Brain
from django.shortcuts import render, redirect
from django.http import JsonResponse
from app.serializers import BrainSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets

# from .srcs.ChatbotEmbeddings import ChatBot

class BrainViewSet(viewsets.ModelViewSet):
    queryset = Brain.objects.all()
    serializer_class = BrainSerializer

def brain_files(request, brain_id):
    brain = Brain.objects.get(id=brain_id)
    files = brain.files.all()
    return render(request, 'brain_files.html', {'brain': brain, 'files': files})
                
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

@api_view(['GET', 'POST', 'DELETE'])
def brain(request, id):
    
    try: 
        data = Brain.objects.get(pk=id)
    except Brain.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = BrainSerializer(data)
        return Response({'brain': serializer.data}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        data.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'POST':
        serializer = BrainSerializer(data, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'brain': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = BrainSerializer(data)
    return Response({'brain': serializer.data}, status=status.HTTP_200_OK)

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
    return render(request, 'http://localhost:8000/api/chatbot/', {'chat_history': chat_history})

@api_view(['POST'])
def chat_view(request):
    
    if 'chat_history' not in request.session:
        request.session['chat_history'] = []
    
    response = "Hello world"
    
    # chatbot = Chatbot()
    
    # # Load context and user answers from session
    # if 'context' in request.session:
    #     chatbot.context = request.session['context']
    # if 'saved_answers' in request.session:
    #     chatbot.saved_answers = request.session['saved_answers']

    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        user_message = data.get("message")
        # response = chatbot.interact(user_message)

        # # Save context to session
        # request.session['context'] = chatbot.context

        # # Store chat messages in session
        # if 'chat_history' not in request.session:
        #     request.session['chat_history'] = []

        request.session['chat_history'].append({
            'role': 'You',
            'message': user_message
        })
        request.session['chat_history'].append({
            'role': 'Brain', # Change form GenInvest to Brain
            'message': response
        })
        request.session.modified = True  # Ensure the session is saved

        # if "done" in user_message.lower():
        #     recommendations = chatbot.get_recommendations()

        #     request.session['saved_answers'] = chatbot.saved_answers

        #     request.session['chat_history'].append({
        #     'role': 'Brain', # Change form GenInvest to Brain
        #     'message': recommendations
        #     })            

        #     return JsonResponse({"response": recommendations})
        return JsonResponse({"response": response})


