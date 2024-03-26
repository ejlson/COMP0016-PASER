import os
import shutil

def sanitize_filename(name):
    """
    Converts the file name to lowercase and replaces spaces with underscores.

    :param name: The original file name.
    :return: The sanitized file name.
    """
    return name.lower().replace(' ', '_')

def flatten_directory(directory):
    """
    Moves all files from subdirectories of the given directory to the main directory,
    ensuring file names are lowercase and spaces are replaced with underscores.
    Deletes the subdirectories once they are empty.

    :param directory: The path to the main directory.
    """
    for root, dirs, files in os.walk(directory, topdown=False):
        # Move each file in the subdirectory to the main directory
        for name in files:
            sanitized_name = sanitize_filename(name)
            file_path = os.path.join(root, name)
            new_path = os.path.join(directory, sanitized_name)
            
            # Ensure there is no filename clash
            if os.path.exists(new_path):
                base, extension = os.path.splitext(sanitized_name)
                counter = 1
                new_basename = f"{base}_{counter}{extension}"
                new_path = os.path.join(directory, new_basename)
                while os.path.exists(new_path):
                    counter += 1
                    new_basename = f"{base}_{counter}{extension}"
                    new_path = os.path.join(directory, new_basename)
            
            shutil.move(file_path, new_path)
        
        # Remove the subdirectory if it's empty
        if root != directory:  # Prevents attempting to delete the main directory itself
            os.rmdir(root)

def process_subdirectories(main_directory):
    """
    Processes each subdirectory within the given main directory by flattening it.

    :param main_directory: The path to the main directory containing subdirectories.
    """
    # List all subdirectories in the main directory
    subdirectories = [os.path.join(main_directory, d) for d in os.listdir(main_directory) if os.path.isdir(os.path.join(main_directory, d))]

    # Apply flatten_directory to each subdirectory
    for subdir in subdirectories:
        flatten_directory(subdir)

# Example usage:
process_subdirectories('/Users/antonzhulkovskiy/Desktop/paser/Research-Actors')

