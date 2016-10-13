import logging

from pyramid.security import authenticated_userid

from karl.utils import find_profiles
from karl.utils import get_setting


logger = logging.getLogger('request_logger')
var = get_setting(None, 'var')
filehandler = logging.FileHandler('%s/log/tracker.log' % var)
filehandler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s')
filehandler.setFormatter(formatter)
logger.addHandler(filehandler)


def request_logger(event):
    request = event.request
    if not (request.path.startswith('/static') or
            request.path.startswith('/newest_feed_items.json')):
        userid = authenticated_userid(request),
        if userid is not None:
            userid = userid[0]
        email = ''
        profiles = find_profiles(request.context)
        profile = profiles.get(userid, None)
        if profile is not None and profile.email:
            email = '(%s)' % profile.email
        client_addr = request.remote_addr
        forwarded = request.headers.get('X-Forwarded-For', None)
        if forwarded is not None:
            client_addr = forwarded.split(',')[0].strip()
        message = '%s - %s - %s %s - %s' % (client_addr,
                                            request.user_agent,
                                            userid or 'Anonymous',
                                            email,
                                            request.path)
        if not (request.path.startswith('/login.html') and
                client_addr.startswith('195.62.')):
            logger.info(message)