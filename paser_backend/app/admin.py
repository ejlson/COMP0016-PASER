from django.contrib import admin
# from app.models import Brain
# admin.site.register(Brain)

from app.models import Brain, File

class FileInline(admin.TabularInline):
    model = File
    extra = 1

class BrainAdmin(admin.ModelAdmin):
    inlines = [FileInline]

admin.site.register(Brain, BrainAdmin)