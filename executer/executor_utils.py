import docker
import os
import shutil
import uuid
from docker.errors import *

IMAGE_NAME = 'coj'
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
TEMP_BUILD_DIR = '%s/tmp/' % CURRENT_DIR

SOURCE_FILE_NAMES = {
    "Java" : "Example.java",
    'Python' : 'example.py'
}

BUILD_COMMANDS = {
    "Java" : "javac",
    "Python" : "python"
}

BINARY_NAMES = {
    "Java" : "Example",
    'Python' : 'example.py'
}

EXECUTE_COMMANDS = {
    "Java" : "java",
    "Python" : "python"
}

client = docker.from_env()


def load_image():
    try:
        client.images.get(IMAGE_NAME)
    except ImageNotFound:
        print 'Image not found locally. Loading from Dockerhub...'
        client.images.pull(IMAGE_NAME)
    except APIError:
        print 'Image not found locally. Dockerhub is not accessable.'
        return
    print 'Image:[%s] loaded' % IMAGE_NAME


def build_and_run(code, lang):
    # define return value
    result = {'build': None, 'run': None, 'error': None}

    # unique identifer for each client
    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = '%s%s' % (TEMP_BUILD_DIR, source_file_parent_dir_name)
    source_file_guest_dir = '/test/%s' % source_file_parent_dir_name

    # create a source file to store code
    make_dir(source_file_host_dir)
    with open('%s/%s' % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    # BUILD
    try:
        client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'Source built.'
        result['build'] = 'ok'
    except ContainerError as e:
        print 'Build failed.'
        result['build'] = e.stderr
        # FAILED! DELETE source_file_host_dir and RETURN result
        shutil.rmtree(source_file_host_dir)
        return result

    # RUN
    try:
        log = client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'Executed.'
        result['run'] = log
    except ContainerError as e:
        print 'Execution failed.'
        result['run'] = e.stderr
        # FAILED! DELETE source_file_host_dir and RETURN result
        shutil.rmtree(source_file_host_dir)
        return result

    # FINISH
    shutil.rmtree(source_file_host_dir)
    return result


def make_dir(directory):
    try:
        os.mkdir(directory)
        print 'Temp build directory [%s] created.' % directory
    except OSError:
        print 'Temp build directory [%s] already exists.' % directory
