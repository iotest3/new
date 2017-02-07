import requests
import yaml

from pyramid.httpexceptions import HTTPFound

from saml2 import (
    BINDING_HTTP_POST,
    BINDING_HTTP_REDIRECT,
    entity,
)
from saml2.client import Saml2Client
from saml2.config import Config as Saml2Config
from saml2.saml import Issuer

from karl.application import root_factory
from karl.views.login import login_user
from karl.utils import find_profiles


class IdentityProvider(object):

    def __init__(self, config):
        if 'metadata_url' in config:
            self.metadata = requests.get(config['metadata_url']).text
        else:
            self.metadata = config['metadata']
        self.name = config['name']

    def client(self, request):
        acs_url = request.route_url('saml', idp=self.name)

        settings = {
            'metadata': {
                'inline': [self.metadata],
                },
            'service': {
                'sp': {
                    'endpoints': {
                        'assertion_consumer_service': [
                            (acs_url, BINDING_HTTP_REDIRECT),
                            (acs_url, BINDING_HTTP_POST),
                        ],
                    },
                    'allow_unsolicited': True,
                    'authn_requests_signed': False,
                    'logout_requests_signed': True,
                    'want_assertions_signed': True,
                    'want_response_signed': False,
                },
            },
        }
        spConfig = Saml2Config()
        spConfig.load(settings)
        spConfig.allow_unknown_attributes = True
        return Saml2Client(config=spConfig)

    def login_url(self, request):
        client = self.client(request)
        issuer = Issuer(
            text='Open Society Foundation',
            format='urn:oasis:names:tc:SAML:2.0:nameid-format:entity')
        reqid, info = client.prepare_for_authenticate(
            issuer=issuer,
            version='2.0',
            provider_name=self.name,
        )
        for name, value in info['headers']:
            if name == 'Location':
                return value

    def username_from_callback(self, request):
        client = self.client(request)
        authn_response = client.parse_authn_request_response(
            request.params['SAMLResponse'],
            entity.BINDING_HTTP_POST)
        authn_response.get_identity()
        user_info = authn_response.get_subject()
        username = user_info.text
        return username


def callback(request):
    provider = request.registry.identity_providers[request.matchdict['idp']]
    email = provider.username_from_callback(request)
    profiles = find_profiles(request.root)
    profile = profiles.getProfileByEmail(email)
    if not profile:
        reason = '{} is not a user in Karl'.format(email)
        redirect = request.resource_url(request.root, 'login.html',
                                        query={'reason': reason})
        return HTTPFound(redirect)

    return login_user(request, profile, email, profile.__name__)


def includeme(config):
    settings = config.registry.settings
    yaml_file = settings.get('saml_idp_config')
    if not yaml_file:
        return

    providers = yaml.load(open(yaml_file))
    idps = [IdentityProvider(provider) for provider in providers]
    config.registry.identity_providers = {idp.name: idp for idp in idps}
    config.add_route('saml', '/saml/{idp}')
    config.add_view('karl.saml.callback', route_name='saml')
