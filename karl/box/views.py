import functools
import uuid

from pyramid.decorator import reify
from pyramid.exceptions import NotFound
from pyramid.httpexceptions import (
    HTTPBadRequest,
    HTTPFound,
)
from pyramid.request import Response
from pyramid.view import view_config

from karl.models.site import Site

from ..views.api import TemplateAPI
from .client import (
    BoxArchive,
    BoxClient,
    find_box,
)


@view_config(context=Site,
             permission='create',
             name='start_box')
def start_box(context, request):
    if find_box(context):
        raise NotFound
    context['box'] = box = BoxArchive()
    return HTTPFound(request.resource_url(box))


# Work around for lack of 'view_defaults' in earlier version of Pyramid
box_view = functools.partial(
    view_config, context=BoxArchive, permission='administer')


class BoxArchiveViews(object):
    """
    Provides UI for logging in to box and receiveing credentials for use by
    the box client, as well as a simple proof of concept that allows uploading
    and downloading files from a Box account.
    """
    def __init__(self, context, request):
        self.context = context
        self.request = request

    @reify
    def client(self):
        return BoxClient(self.context, self.request.registry.settings)

    @box_view(
        renderer='templates/show_box.pt',
    )
    def show_box(self):
        box = self.context
        request = self.request
        page_title = 'Box'

        # If not logged in, set up 'state' for CSRF protection
        if not box.logged_in and not box.state:
            box.state = str(uuid.uuid4())
            files = None
        else:
            files = self.client.folder_listing()
            for f in files:
                f['url'] = self.request.resource_url(
                    box, '@@download',
                    query={'id': f['id']})

        return {
            'api': TemplateAPI(box, request, page_title),
            'files': files,
        }

    @box_view(
        name='box_auth'
    )
    def box_auth(self):
        box = self.context
        request = self.request

        # CSRF protection
        if request.params['state'] != box.state:
            raise HTTPBadRequest("state does not match")
        box.state = None

        # Get access token
        self.client.authorize(request.params['code'])
        return HTTPFound(request.resource_url(box))

    @box_view(
        name='upload'
    )
    def box_upload(self):
        f = self.request.params['file']
        self.client.upload_file(f.file, f.filename)
        return HTTPFound(self.request.resource_url(self.context))

    @box_view(
        name='download'
    )
    def box_download(self):
        request = self.request
        content_type, stream = self.client.download_file(request.params['id'])
        block_size = 4096
        app_iter = iter(lambda: stream.read(block_size), '')
        return Response(app_iter=app_iter, content_type=content_type)

    @reify
    def redirect_uri(self):
        return self.request.resource_url(self.context, '@@box_auth')
