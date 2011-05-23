# Copyright (C) 2008-2009 Open Society Institute
#               Thomas Moroz: tmoroz@sorosny.org
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License Version 2 as published
# by the Free Software Foundation.  You may not use, modify or distribute
# this program under any other version of the GNU General Public License.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

import unittest

from zope.interface import Interface
from zope.interface import taggedValue
from repoze.bfg.testing import cleanUp

from repoze.bfg import testing

from karl.testing import DummyCatalog
from karl.testing import DummyFolderCustomizer
from karl.testing import DummyFolderAddables
from karl.testing import DummyTagQuery
from karl.testing import registerLayoutProvider

class TestShowFolderView(unittest.TestCase):
    def setUp(self):
        cleanUp()
        registerLayoutProvider()

    def tearDown(self):
        cleanUp()

    def _callFUT(self, context, request):
        from karl.content.views.files import show_folder_view
        return show_folder_view(context, request)

    def _register(self, permissions=None):
        from karl.content.views.interfaces import IFileInfo
        testing.registerAdapter(DummyFileInfo, (Interface, Interface),
                                IFileInfo)
        from karl.models.interfaces import ITagQuery
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)

        # Register dummy IFolderAddables
        from karl.views.interfaces import IFolderAddables
        testing.registerAdapter(DummyFolderAddables, (Interface, Interface),
                                IFolderAddables)

        if permissions is not None:
            from repoze.bfg.interfaces import IAuthenticationPolicy
            from repoze.bfg.interfaces import IAuthorizationPolicy
            from repoze.bfg.testing import registerUtility
            policy = DummySecurityPolicy("userid", permissions=permissions)
            registerUtility(policy, IAuthenticationPolicy)
            registerUtility(policy, IAuthorizationPolicy)

    def _make_community(self):
        # Register dummy catalog search
        # (the folder view needs it for the reorganize widget)
        from karl.models.interfaces import ICatalogSearch
        testing.registerAdapter(DummySearch, (Interface, ),
                                ICatalogSearch)

        # factorize a fake community
        from karl.models.interfaces import ICommunity
        from zope.interface import directlyProvides
        community = testing.DummyModel(title='thecommunity')
        directlyProvides(community, ICommunity)
        community.catalog = MyDummyCatalog()
        return community

    def test_notcommunityrootfolder(self):
        self._register()
        community = self._make_community()
        folder = testing.DummyModel(title='parent')
        community['files'] = folder
        context = testing.DummyModel(title='thetitle')
        folder['child'] = context
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        actions = response['actions']
        self.assertEqual(len(actions), 4)
        self.assertEqual(actions[0][1], 'add_folder.html')
        self.assertEqual(actions[1][1], 'add_file.html')
        self.assertEqual(actions[2][1], 'edit.html')
        self.assertEqual(actions[3][1], 'delete.html')

    def test_communityrootfolder(self):
        from karl.content.interfaces import ICommunityRootFolder
        from zope.interface import directlyProvides
        self._register()
        community = self._make_community()
        context = testing.DummyModel(title='thetitle')
        community['files'] = context
        request = testing.DummyRequest()
        directlyProvides(context, ICommunityRootFolder)
        response = self._callFUT(context, request)
        actions = response['actions']
        self.assertEqual(len(actions), 2)
        self.assertEqual(actions[0][1], 'add_folder.html')
        self.assertEqual(actions[1][1], 'add_file.html')

    def test_read_only(self):
        root = self._make_community()
        root['files'] = context = testing.DummyModel(title='thetitle')
        self._register({context: ('view',),})
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response['actions'], [])

    def test_editable(self):
        root = self._make_community()
        root['files'] = context = testing.DummyModel(title='thetitle')
        self._register({context: ('view', 'edit'),})
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response['actions'], [('Edit', 'edit.html')])

    def test_deletable(self):
        root = self._make_community()
        root['files'] = context = testing.DummyModel(title='thetitle')
        self._register({context.__parent__: ('view', 'delete'),})
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response['actions'], [('Delete', 'delete.html')])

    def test_delete_is_for_children_not_container(self):
        root = self._make_community()
        root['files'] = context = testing.DummyModel(title='thetitle')
        self._register({context: ('view', 'delete'),})
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response['actions'], [])

    def test_creatable(self):
        root = self._make_community()
        root['files'] = context = testing.DummyModel(title='thetitle')
        self._register({context: ('view', 'create'),})
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response['actions'], [
            ('Add Folder', 'add_folder.html'), ('Add File', 'add_file.html')])

class Test_redirect_to_add_form(unittest.TestCase):

    def _callFUT(self, context, request):
        from karl.content.views.files import redirect_to_add_form
        return redirect_to_add_form(context, request)

    def test_it(self):
        from webob.exc import HTTPFound
        context = testing.DummyModel()
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.failUnless(isinstance(response, HTTPFound))
        self.assertEqual(response.location,
                         'http://example.com/add_file.html')

class TestAddFolderFormController(unittest.TestCase):
    def setUp(self):
        testing.setUp()
        registerLayoutProvider()

    def tearDown(self):
        testing.tearDown()

    def _register(self):
        from repoze.bfg import testing
        from karl.models.interfaces import ITagQuery
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)

        # Register dummy IFolderCustomizer
        from karl.content.views.interfaces import IFolderCustomizer
        testing.registerAdapter(DummyFolderCustomizer, (Interface, Interface),
                                IFolderCustomizer)

    def _makeOne(self, *arg, **kw):
        from karl.content.views.files import AddFolderFormController
        return AddFolderFormController(*arg, **kw)

    def _registerDummyWorkflow(self):
        from repoze.workflow.testing import registerDummyWorkflow
        wf = DummyWorkflow(
            [{'transitions':['private'],'name': 'public', 'title':'Public'},
             {'transitions':['public'], 'name': 'private', 'title':'Private'}])
        workflow = registerDummyWorkflow('security', wf)
        return workflow

    def test_form_defaults(self):
        workflow = self._registerDummyWorkflow()
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        defaults = controller.form_defaults()
        self.assertEqual(defaults['title'], '')
        self.assertEqual(defaults['tags'], [])
        self.assertEqual(defaults['security_state'], workflow.initial_state)

    def test_form_fields(self):
        self._registerDummyWorkflow()
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        fields = controller.form_fields()
        self.failUnless('title' in dict(fields))
        self.failUnless('tags' in dict(fields))
        self.failUnless('security_state' in dict(fields))

    def test_form_widgets(self):
        self._registerDummyWorkflow()
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        widgets = controller.form_widgets({'security_state':True})
        self.failUnless('security_state' in widgets)
        self.failUnless('title' in widgets)

    def test___call__(self):
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        response = controller()
        self.failUnless('api' in response)
        self.failUnless(response['api'].page_title)

    def test_handle_cancel(self):
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_cancel()
        self.assertEqual(response.location, 'http://example.com/')

    def test_handle_submit(self):
        self._register()
        self._registerDummyWorkflow()

        testing.registerDummySecurityPolicy('userid')
        context = testing.DummyModel()
        context.catalog = DummyCatalog()
        context.tags = DummyTagEngine()
        converted = {
            'title':'a title',
            'security_state': 'private',
            'tags': ['thetesttag'],
            }
        from karl.content.interfaces import ICommunityFolder
        from repoze.lemonade.interfaces import IContentFactory
        testing.registerAdapter(lambda *arg: DummyCommunityFolder,
                                (ICommunityFolder,),
                                IContentFactory)
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        self.assertEqual(response.location, 'http://example.com/a-title/')
        self.assertEqual(context['a-title'].title, u'a title')
        self.assertEqual(context['a-title'].userid, 'userid')
        self.assertEqual(context.tags.updated,
            [(None, 'userid', ['thetesttag'])])

class TestDeleteFolderView(unittest.TestCase):
    def setUp(self):
        cleanUp()

    def tearDown(self):
        cleanUp()

    def _callFUT(self, context, request, delegate):
        from karl.content.views.files import delete_folder_view
        return delete_folder_view(context, request, delegate)

    def test_it(self):
        dummy_calls = []
        def dummy_delete_resource_view(context, request, num_children):
            dummy_calls.append((context, request, num_children))

        context = testing.DummyModel()
        context['foo'] = testing.DummyModel()
        context['bar'] = testing.DummyModel()
        request = 'Dummy'

        self._callFUT(context, request, dummy_delete_resource_view)
        self.assertEqual(dummy_calls, [(context, request, 2)])

class TestAddFileFormController(unittest.TestCase):
    def setUp(self):
        cleanUp()
        registerLayoutProvider()

    def tearDown(self):
        cleanUp()

    def _makeOne(self, context, request, check_upload_size=None):
        from karl.content.views.files import AddFileFormController
        controller = AddFileFormController(context, request)
        if check_upload_size is not None:
            controller.check_upload_size = check_upload_size
        return controller

    def _register(self):
        from karl.models.interfaces import ITagQuery
        from karl.content.views.interfaces import IShowSendalert
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)
        testing.registerAdapter(DummyShowSendalert, (Interface, Interface),
                                IShowSendalert)

        # Register mail utility
        from repoze.sendmail.interfaces import IMailDelivery
        from karl.testing import DummyMailer
        self.mailer = DummyMailer()
        testing.registerUtility(self.mailer, IMailDelivery)

        from karl.content.views.adapters import CommunityFileAlert
        from karl.content.interfaces import ICommunityFile
        from karl.models.interfaces import IProfile
        from repoze.bfg.interfaces import IRequest
        from karl.utilities.interfaces import IAlert
        testing.registerAdapter(CommunityFileAlert,
                                (ICommunityFile, IProfile, IRequest),
                                IAlert)

    def _registerDummyWorkflow(self):
        from repoze.workflow.testing import registerDummyWorkflow
        wf = DummyWorkflow(
            [{'transitions':['private'],'name': 'public', 'title':'Public'},
             {'transitions':['public'], 'name': 'private', 'title':'Private'}])
        workflow = registerDummyWorkflow('security', wf)
        return workflow

    def _makeRequest(self):
        request = testing.DummyRequest()
        request.environ['repoze.browserid'] = '1'
        return request

    def _makeContext(self):
        sessions = DummySessions()
        context = testing.DummyModel(sessions=sessions)
        return context

    def test_form_defaults(self):
        self._register()
        workflow = self._registerDummyWorkflow()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        defaults = controller.form_defaults()
        self.assertEqual(defaults['title'], '')
        self.assertEqual(defaults['tags'], [])
        self.assertEqual(defaults['file'], None)
        self.assertEqual(defaults['sendalert'], True)
        self.assertEqual(defaults['security_state'], workflow.initial_state)

    def test_form_fields(self):
        self._register()
        self._registerDummyWorkflow()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        fields = dict(controller.form_fields())
        self.failUnless('tags' in fields)
        self.failUnless('security_state' in fields)
        self.failUnless('title' in fields)
        self.failUnless('file' in fields)
        self.failUnless('sendalert' in fields)

    def test_form_widgets(self):
        self._register()
        self._registerDummyWorkflow()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        widgets = controller.form_widgets({'security_state':True,
                                           'sendalert':True})
        self.failUnless('security_state' in widgets)
        self.failUnless('file' in widgets)
        self.failUnless('title' in widgets)
        self.failUnless('sendalert' in widgets)
        self.failUnless('tags' in widgets)

    def test___call__(self):
        self._register()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller()
        self.failUnless('api' in response)
        self.failUnless('layout' in response)
        self.failUnless(response['api'].page_title)

    def test_handle_cancel(self):
        self._register()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_cancel()
        self.assertEqual(response.location, 'http://example.com/')

    def test_handle_submit_filename_with_only_symbols(self):
        from repoze.bfg.formish import ValidationError
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        self._register()

        testing.registerDummySecurityPolicy('userid')
        context = self._makeContext()
        context.catalog = DummyCatalog()
        from schemaish.type import File as SchemaFile
        fs = SchemaFile(None, None, '???')
        request = self._makeRequest()
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': '0',
            'security_state': 'private',
            'tags':[],
            }
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request)
        self.assertRaises(ValidationError, controller.handle_submit, converted)

    def test_handle_submit_valid(self):
        from schemaish.type import File as SchemaFile
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        from repoze.bfg.formish import ValidationError
        self._register()

        testing.registerDummySecurityPolicy('userid')
        context = self._makeContext()
        context.catalog = DummyCatalog()
        fs = SchemaFile('abc', 'filename', 'x/foo')
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': False,
            'security_state': 'public',
            'tags':['thetesttag'],
            }
        request = self._makeRequest()
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        self.assertEqual(response.location, 'http://example.com/filename/')
        self.assertEqual(context['filename'].title, u'a title')
        self.assertEqual(context['filename'].creator, 'userid')
        self.assertEqual(context['filename'].stream, 'abc')
        self.assertEqual(context['filename'].mimetype, 'x/foo')
        self.assertEqual(context['filename'].filename, 'filename')

        # attempt a duplicate upload
        self.assertRaises(ValidationError, controller.handle_submit, converted)

    def test_handle_submit_filename_with_only_symbols_and_smartquote(self):
        from repoze.bfg.formish import ValidationError
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        self._register()

        testing.registerDummySecurityPolicy('userid')
        context = self._makeContext()
        context.catalog = DummyCatalog()
        from schemaish.type import File as SchemaFile
        fs = SchemaFile(None, None, u'??\u2019')
        request = self._makeRequest()
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': '0',
            'security_state': 'private',
            'tags':[],
            }
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request)
        self.assertRaises(ValidationError, controller.handle_submit, converted)

    def test_handle_submit_full_path_filename(self):
        from schemaish.type import File as SchemaFile
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        from repoze.bfg.formish import ValidationError
        self._register()

        testing.registerDummySecurityPolicy('userid')
        context = self._makeContext()
        context.catalog = DummyCatalog()
        fs = SchemaFile('abc', r"C:\Documents and Settings\My Tests\filename",
                        'x/foo')
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': False,
            'security_state': 'public',
            'tags':['thetesttag'],
            }
        request = self._makeRequest()
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        self.assertEqual(response.location, 'http://example.com/filename/')
        self.assertEqual(context['filename'].title, u'a title')
        self.assertEqual(context['filename'].creator, 'userid')
        self.assertEqual(context['filename'].stream, 'abc')
        self.assertEqual(context['filename'].mimetype, 'x/foo')
        self.assertEqual(context['filename'].filename, 'filename')

        # attempt a duplicate upload
        self.assertRaises(ValidationError, controller.handle_submit, converted)


    def test_handle_submit_valid_alert(self):
        self._register()

        testing.registerDummySecurityPolicy('userid')

        from zope.interface import directlyProvides
        from karl.models.interfaces import ICommunity
        from karl.testing import DummyProfile
        context = testing.DummyModel(title='title')
        directlyProvides(context, ICommunity)
        context.member_names = set(['a', 'b'])
        context.moderator_names = set(['c'])
        profiles = context["profiles"] = testing.DummyModel()
        profiles["a"] = DummyProfile()
        profiles["b"] = DummyProfile()
        profiles["c"] = DummyProfile()
        profiles["userid"] = DummyProfile()

        context.catalog = DummyCatalog()
        context.sessions = DummySessions()
        request = self._makeRequest()
        from schemaish.type import File as SchemaFile
        fs = SchemaFile('abc', 'filename', 'x/foo')
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': True,
            'security_state': 'public',
            'tags':[],
            }
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request)
        testing.registerDummyRenderer(
            'karl.content.views:templates/email_community_file_alert.pt')
        response = controller.handle_submit(converted)
        self.assertEqual(response.location, 'http://example.com/filename/')
        self.assertEqual(context['filename'].title, u'a title')
        self.assertEqual(context['filename'].creator, 'userid')
        self.assertEqual(context['filename'].stream, 'abc')
        self.assertEqual(context['filename'].mimetype, 'x/foo')
        self.assertEqual(context['filename'].filename, 'filename')

        self.assertEqual(3, len(self.mailer))

    def test_submitted_toobig(self):
        self._register()

        from repoze.bfg.formish import ValidationError

        def check_upload_size(*args):
            raise ValidationError(file='TEST VALIDATION ERROR')

        testing.registerDummySecurityPolicy('userid')
        context = self._makeContext()
        context.catalog = DummyCatalog()
        request = self._makeRequest()
        from schemaish.type import File as SchemaFile
        fs = SchemaFile('abc', 'filename', 'x/foo')
        converted = {
            'file': fs,
            'title': 'a title',
            'sendalert': False,
            'security_state': 'public',
            'tags':[],
            }
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.testing import registerContentFactory
        registerContentFactory(DummyCommunityFile, ICommunityFile)
        controller = self._makeOne(context, request, check_upload_size)
        self.assertRaises(ValidationError, controller.handle_submit, converted)

class TestShowFileView(unittest.TestCase):
    def setUp(self):
        cleanUp()
        registerLayoutProvider()

    def tearDown(self):
        cleanUp()

    def _callFUT(self, context, request):
        from karl.content.views.files import show_file_view
        return show_file_view(context, request)

    def test_it(self):

        from karl.content.views.interfaces import IFileInfo
        from karl.models.interfaces import ITagQuery
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)
        parent = testing.DummyModel(title='parent')
        context = testing.DummyModel(title='thetitle')
        parent['child'] = context
        request = testing.DummyRequest()
        renderer  = testing.registerDummyRenderer('templates/show_file.pt')

        testing.registerAdapter(DummyFileInfo, (Interface, Interface),
                                IFileInfo)

        self._callFUT(context, request)
        actions = renderer.actions
        self.assertEqual(len(actions), 2)
        self.assertEqual(actions[0][1], 'edit.html')
        self.assertEqual(actions[1][1], 'delete.html')

class TestDownloadFileView(unittest.TestCase):
    def setUp(self):
        cleanUp()

    def tearDown(self):
        cleanUp()

    def _callFUT(self, context, request):
        from karl.content.views.files import download_file_view
        return download_file_view(context, request)

    def test_view(self):
        context = testing.DummyModel()
        blobfile = DummyBlobFile()
        context.blobfile = blobfile
        context.mimetype = 'x/foo'
        context.filename = 'thefilename'
        context.size = 42
        request = testing.DummyRequest()
        response = self._callFUT(context, request)
        self.assertEqual(response.headerlist[0],
                         ('Content-Type', 'x/foo'))
        self.assertEqual(response.headerlist[1],
                         ('Content-Length', '42'))
        self.assertEqual(response.app_iter, blobfile)

    def test_save(self):
        context = testing.DummyModel()
        blobfile = DummyBlobFile()
        context.blobfile = blobfile
        context.mimetype = 'x/foo'
        context.filename = 'thefilename'
        context.size = 42
        request = testing.DummyRequest(params=dict(save=1))
        response = self._callFUT(context, request)
        self.assertEqual(response.headerlist[0],
                         ('Content-Type', 'x/foo'))
        self.assertEqual(response.headerlist[1],
                         ('Content-Length', '42'))
        self.assertEqual(response.headerlist[2],
                         ('Content-Disposition',
                          'attachment; filename=thefilename'))
        self.assertEqual(response.app_iter, blobfile)

    def test_save_filename_has_tabs_and_newlines(self):
        context = testing.DummyModel()
        blobfile = DummyBlobFile()
        context.blobfile = blobfile
        context.mimetype = 'x/foo'
        context.filename = 'the\nfile\tname'
        context.size = 42
        request = testing.DummyRequest(params=dict(save=1))
        response = self._callFUT(context, request)
        self.assertEqual(response.headerlist[0],
                         ('Content-Type', 'x/foo'))
        self.assertEqual(response.headerlist[1],
                         ('Content-Length', '42'))
        self.assertEqual(response.headerlist[2],
                         ('Content-Disposition',
                          'attachment; filename=the file name'))
        self.assertEqual(response.app_iter, blobfile)

class TestThumbnailView(unittest.TestCase):
    def setUp(self):
        cleanUp()

    def tearDown(self):
        cleanUp()

    def _get_context(self):
        # A little easier to do an integration test here.
        from pkg_resources import resource_stream
        from karl.content.models.files import CommunityFile
        return CommunityFile(
            'Title',
            resource_stream('karl.content.models.tests', 'test.jpg'),
            'image/jpeg',
            'test.jpg',
            'chris',
        )

    def _callFUT(self, context, request):
        from karl.content.views.files import thumbnail_view
        return thumbnail_view(context, request)

    def test_it(self):
        import PIL.Image
        from cStringIO import StringIO
        context = self._get_context()
        request = testing.DummyRequest()
        request.subpath = ('300x200.jpg',)

        response = self._callFUT(context, request)
        self.assertEqual(response.content_type, 'image/jpeg')
        image = PIL.Image.open(StringIO(response.body))
        self.assertEqual(image.size, (137, 200))

class TestEditFolderFormController(unittest.TestCase):
    def setUp(self):
        testing.setUp()
        registerLayoutProvider()

    def tearDown(self):
        testing.tearDown()

    def _register(self):
        from repoze.bfg import testing
        from karl.models.interfaces import ITagQuery
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)

        # Register dummy IFolderCustomizer
        from karl.content.views.interfaces import IFolderCustomizer
        testing.registerAdapter(DummyFolderCustomizer, (Interface, Interface),
                                IFolderCustomizer)

    def _makeOne(self, *arg, **kw):
        from karl.content.views.files import EditFolderFormController
        return EditFolderFormController(*arg, **kw)

    def _registerDummyWorkflow(self):
        from repoze.workflow.testing import registerDummyWorkflow
        wf = DummyWorkflow(
            [{'transitions':['private'],'name': 'public', 'title':'Public'},
             {'transitions':['public'], 'name': 'private', 'title':'Private'}])
        workflow = registerDummyWorkflow('security', wf)
        return workflow

    def test_form_defaults(self):
        self._registerDummyWorkflow()
        context = testing.DummyModel()
        context.title = 'title'
        context.security_state = 'private'
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        defaults = controller.form_defaults()
        self.assertEqual(defaults['title'], 'title')
        self.assertEqual(defaults['tags'], [])
        self.assertEqual(defaults['security_state'], 'private')

    def test_form_fields(self):
        self._registerDummyWorkflow()
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        fields = controller.form_fields()
        self.failUnless('title' in dict(fields))
        self.failUnless('tags' in dict(fields))
        self.failUnless('security_state' in dict(fields))

    def test_form_widgets(self):
        self._register()
        self._registerDummyWorkflow()
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        widgets = controller.form_widgets({'security_state':True})
        self.failUnless('security_state' in widgets)
        self.failUnless('title' in widgets)

    def test___call__(self):
        context = testing.DummyModel()
        context.title = 'title'
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        response = controller()
        self.failUnless('api' in response)
        self.assertEqual(response['api'].page_title, 'Edit title')

    def test_handle_cancel(self):
        context = testing.DummyModel()
        request = testing.DummyRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_cancel()
        self.assertEqual(response.location, 'http://example.com/')

    def test_handle_submit(self):
        self._register()
        from karl.models.interfaces import IObjectModifiedEvent
        request = testing.DummyRequest()
        context = testing.DummyModel(title='oldtitle')
        context.catalog = DummyCatalog()
        request = testing.DummyRequest()
        converted = {
            'title':'new title',
            'security_state': 'private',
            'tags': ['thetesttag'],
            }
        L = testing.registerEventListener((Interface, IObjectModifiedEvent))
        testing.registerDummySecurityPolicy('testeditor')
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        msg = 'http://example.com/?status_message=Folder+changed'
        self.assertEqual(response.location, msg)
        self.assertEqual(context.title, u'new title')
        self.assertEqual(L[0], context)
        self.assertEqual(L[1].object, context)
        self.assertEqual(context.modified_by, 'testeditor')

class TestEditFileFormController(unittest.TestCase):
    def setUp(self):
        cleanUp()
        registerLayoutProvider()

    def tearDown(self):
        cleanUp()

    def _makeOne(self, context, request):
        from karl.content.views.files import EditFileFormController
        return EditFileFormController(context, request)

    def _makeRequest(self):
        request = testing.DummyRequest()
        request.environ['repoze.browserid'] = '1'
        return request

    def _makeContext(self):
        sessions = DummySessions()
        context = testing.DummyModel(sessions=sessions)
        return context

    def _register(self):
        from karl.models.interfaces import ITagQuery
        from karl.content.views.interfaces import IShowSendalert
        testing.registerAdapter(DummyTagQuery, (Interface, Interface),
                                ITagQuery)
        testing.registerAdapter(DummyShowSendalert, (Interface, Interface),
                                IShowSendalert)

        # Register mail utility
        from repoze.sendmail.interfaces import IMailDelivery
        from karl.testing import DummyMailer
        self.mailer = DummyMailer()
        testing.registerUtility(self.mailer, IMailDelivery)

    def _registerDummyWorkflow(self):
        # Register security workflow
        from repoze.workflow.testing import registerDummyWorkflow
        wf = DummyWorkflow(
            [{'transitions':['private'],'name': 'public', 'title':'Public'},
             {'transitions':['public'], 'name': 'private', 'title':'Private'}])
        workflow = registerDummyWorkflow('security', wf)
        return workflow

    def test_form_defaults(self):
        self._register()
        self._registerDummyWorkflow()
        context = self._makeContext()
        context.title = 'title'
        context.security_state = 'private'
        context.tags = []
        context.filename = 'thefile'
        context.mimetype = 'text/xml'
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        defaults = controller.form_defaults()
        self.assertEqual(defaults['title'], 'title')
        self.assertEqual(defaults['tags'], [])
        self.assertEqual(defaults['security_state'], 'private')
        self.assertEqual(defaults['file'].filename, 'thefile')
        self.assertEqual(defaults['file'].mimetype, 'text/xml')

    def test_form_fields(self):
        self._register()
        self._registerDummyWorkflow()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        fields = controller.form_fields()
        schema = dict(fields)
        self.failUnless('title' in schema)
        self.failUnless('tags' in schema)
        self.failUnless('security_state' in schema)
        self.failUnless('tags' in schema)

    def test_form_widgets(self):
        self._register()
        self._registerDummyWorkflow()
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        widgets = controller.form_widgets({'security_state':True,
                                           'sendalert':True})
        self.failUnless('title' in widgets)
        self.failUnless('tags' in widgets)
        self.failUnless('security_state' in widgets)
        self.failUnless('tags' in widgets)

    def test___call__(self):
        context = self._makeContext()
        context.title = 'title'
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller()
        self.failUnless('api' in response)
        self.failUnless('layout' in response)
        self.failUnless('actions' in response)
        self.assertEqual(response['api'].page_title, 'Edit title')

    def test_handle_cancel(self):
        context = self._makeContext()
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_cancel()
        self.assertEqual(response.location, 'http://example.com/')

    def test_handle_submit_valid(self):
        from karl.models.interfaces import ISite
        from zope.interface import directlyProvides
        from schemaish.type import File as SchemaFile
        from karl.models.interfaces import IObjectModifiedEvent
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.interfaces import IContentFactory

        self._register()

        context = DummyFile(title='oldtitle')
        context.__name__ = None
        context.__parent__ = None
        context.sessions = DummySessions()
        context.catalog = DummyCatalog()
        directlyProvides(context, ISite)
        converted = {
            'title': 'new title',
            'file': SchemaFile('abc', 'filename', 'x/foo'),
            'security_state': 'public',
            'tags': ['thetesttag'],
            }
        testing.registerAdapter(lambda *arg: DummyCommunityFile,
                                (ICommunityFile,),
                                IContentFactory)
        L = testing.registerEventListener((Interface, IObjectModifiedEvent))
        testing.registerDummySecurityPolicy('testeditor')
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        self.assertEqual(response.location,
                         'http://example.com/?status_message=File+changed')
        self.assertEqual(len(L), 2)
        self.assertEqual(context.title, u'new title')
        self.assertEqual(context.mimetype, 'x/foo')
        self.assertEqual(context.filename, 'filename')
        self.assertEqual(L[0], context)
        self.assertEqual(L[1].object, context)
        self.assertEqual(context.stream, 'abc')
        self.assertEqual(context.modified_by, 'testeditor')

    def test_handle_submit_valid_nofile_noremove(self):
        from karl.models.interfaces import ISite
        from zope.interface import directlyProvides
        from schemaish.type import File as SchemaFile
        from karl.models.interfaces import IObjectModifiedEvent
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.interfaces import IContentFactory

        self._register()

        context = DummyFile(title='oldtitle')
        context.__name__ = None
        context.__parent__ = None
        context.mimetype = 'old/type'
        context.filename = 'old_name'
        context.stream = 'old'
        context.sessions = DummySessions()
        context.catalog = DummyCatalog()
        directlyProvides(context, ISite)
        converted = {
            'title': 'new title',
            'file': SchemaFile(None, None, None),
            'security_state': 'public',
            'tags': ['thetesttag'],
            }
        testing.registerAdapter(lambda *arg: DummyCommunityFile,
                                (ICommunityFile,),
                                IContentFactory)
        L = testing.registerEventListener((Interface, IObjectModifiedEvent))
        testing.registerDummySecurityPolicy('testeditor')
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        response = controller.handle_submit(converted)
        self.assertEqual(response.location,
                         'http://example.com/?status_message=File+changed')
        self.assertEqual(len(L), 2)
        self.assertEqual(context.title, u'new title')
        self.assertEqual(context.mimetype, 'old/type')
        self.assertEqual(context.filename, 'old_name')
        self.assertEqual(L[0], context)
        self.assertEqual(L[1].object, context)
        self.assertEqual(context.stream, 'old')
        self.assertEqual(context.modified_by, 'testeditor')

    def test_handle_submit_valid_nofile_withremove(self):
        from repoze.bfg.formish import ValidationError
        from karl.models.interfaces import ISite
        from zope.interface import directlyProvides
        from schemaish.type import File as SchemaFile
        from karl.models.interfaces import IObjectModifiedEvent
        from karl.content.interfaces import ICommunityFile
        from repoze.lemonade.interfaces import IContentFactory

        self._register()

        context = DummyFile(title='oldtitle')
        context.__name__ = None
        context.__parent__ = None
        context.mimetype = 'old/type'
        context.filename = 'old_name'
        context.stream = 'old'
        context.sessions = DummySessions()
        context.catalog = DummyCatalog()
        directlyProvides(context, ISite)
        converted = {
            'title': 'new title',
            'file': SchemaFile(None, None, None, metadata={'remove':True}),
            'security_state': 'public',
            'tags': ['thetesttag'],
            }
        testing.registerAdapter(lambda *arg: DummyCommunityFile,
                                (ICommunityFile,),
                                IContentFactory)
        testing.registerDummySecurityPolicy('testeditor')
        request = self._makeRequest()
        controller = self._makeOne(context, request)
        self.assertRaises(ValidationError, controller.handle_submit, converted)

class TestAdvancedFolderView(unittest.TestCase):
    def setUp(self):
        cleanUp()
        registerLayoutProvider()
        testing.registerDummyRenderer('karl.views:templates/formfields.pt')

    def tearDown(self):
        cleanUp()

    def _callFUT(self, context, request):
        from karl.content.views.files import advanced_folder_view
        return advanced_folder_view(context, request)

    def test_render(self):
        context = testing.DummyModel(title='Dummy')
        request = testing.DummyRequest()
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(renderer.post_url, "http://example.com/advanced.html")

    def test_render_reference_manual(self):
        from karl.content.interfaces import IReferencesFolder
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, IReferencesFolder)
        request = testing.DummyRequest()
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(renderer.post_url, "http://example.com/advanced.html")
        self.assertEqual(renderer.selected, 'reference_manual')

    def test_render_network_news(self):
        from karl.content.views.interfaces import INetworkNewsMarker
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, INetworkNewsMarker)
        request = testing.DummyRequest()
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(renderer.post_url, "http://example.com/advanced.html")
        self.assertEqual(renderer.selected, 'network_news')

    def test_render_network_events(self):
        from karl.content.views.interfaces import INetworkEventsMarker
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, INetworkEventsMarker)
        request = testing.DummyRequest()
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(renderer.post_url, "http://example.com/advanced.html")
        self.assertEqual(renderer.selected, 'network_events')

    def test_cancel(self):
        context = testing.DummyModel(title='Dummy')
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.cancel': '1',
                })
            )
        response = self._callFUT(context, request)
        self.assertEqual(response.location, "http://example.com/")

    def test_submit_no_marker(self):
        context = testing.DummyModel(title='Dummy')
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(renderer.post_url, "http://example.com/advanced.html")

    def test_submit_reference_manual(self):
        context = testing.DummyModel(title='Dummy')
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'reference_manual',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        self.failUnless(IReferencesFolder.providedBy(context))
        self.failIf(INetworkNewsMarker.providedBy(context))
        self.failIf(INetworkEventsMarker.providedBy(context))

    def test_submit_network_news(self):
        context = testing.DummyModel(title='Dummy')
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'network_news',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        self.failIf(IReferencesFolder.providedBy(context))
        self.failUnless(INetworkNewsMarker.providedBy(context))
        self.failIf(INetworkEventsMarker.providedBy(context))

    def test_submit_network_events(self):
        context = testing.DummyModel(title='Dummy')
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'network_events',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        self.failIf(IReferencesFolder.providedBy(context))
        self.failIf(INetworkNewsMarker.providedBy(context))
        self.failUnless(INetworkEventsMarker.providedBy(context))

    def test_submit_change_to_reference_manual(self):
        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, INetworkNewsMarker)
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'reference_manual',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        self.failUnless(IReferencesFolder.providedBy(context))
        self.failIf(INetworkNewsMarker.providedBy(context))
        self.failIf(INetworkEventsMarker.providedBy(context))

    def test_submit_change_to_network_news(self):
        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, INetworkEventsMarker)
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'network_news',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        self.failIf(IReferencesFolder.providedBy(context))
        self.failUnless(INetworkNewsMarker.providedBy(context))
        self.failIf(INetworkEventsMarker.providedBy(context))

    def test_submit_change_to_network_events(self):
        from karl.content.interfaces import IReferencesFolder
        from karl.content.views.interfaces import INetworkNewsMarker
        from karl.content.views.interfaces import INetworkEventsMarker
        from zope.interface import alsoProvides
        context = testing.DummyModel(title='Dummy')
        alsoProvides(context, IReferencesFolder)
        from webob.multidict import MultiDict
        request = testing.DummyRequest(
            params=MultiDict({
                'form.submitted': '1',
                'marker': 'network_events',
                })
            )
        renderer = testing.registerDummyRenderer(
            'templates/advanced_folder.pt')
        response = self._callFUT(context, request)
        self.assertEqual(response.location,
                         "http://example.com/?status_message=Marker+changed")

        self.failIf(IReferencesFolder.providedBy(context))
        self.failIf(INetworkNewsMarker.providedBy(context))
        self.failUnless(INetworkEventsMarker.providedBy(context))


from zope.interface import implements

class DummyBlobFile:
    def open(self):
        return self

class DummyCommunityFolder:
    def __init__(self, title, userid):
        self.title = title
        self.userid = userid

from karl.content.interfaces import ICommunityFile
class DummyCommunityFile(testing.DummyModel):
    implements(ICommunityFile)
    size = 3

class DummyFile(testing.DummyModel):
    size = 3
    def upload(self, stream):
        self.stream = stream

class DummyFileInfo(object):
    def __init__(self, item, request):
        self.title = 'title'
        self.url = 'url'
        self.mimeinfo = {'small_icon_name': 'folder_small.gif', 'title': 'Folder'}
        self.modified = '12/12/2008'

class DummyModifiedDateIndex:
    def discriminator(self, obj, default):
        return obj.modified

class DummyTagEngine:
    def __init__(self):
        self.updated = []
    def update(self, item, user, tags):
        self.updated.append((item, user, tags))

class DummyWorkflow:
    state_attr = 'security_state'
    initial_state = 'initial'
    def __init__(self, state_info=[
        {'name':'public', 'transitions':['private']},
        {'name':'private', 'transitions':['public']},
        ]):
        self.transitioned = []
        self._state_info = state_info

    def state_info(self, context, request):
        return self._state_info

    def initialize(self, content):
        self.initialized = True

    def transition_to_state(self, content, request, to_state, context=None,
                            guards=(), skip_same=True):
        self.transitioned.append({'to_state':to_state, 'content':content,
                                  'request':request, 'guards':guards,
                                  'context':context, 'skip_same':skip_same})

    def state_of(self, content):
        return getattr(content, self.state_attr, None)

class DummySessions(dict):
    def get(self, name, default=None):
        if name not in self:
            self[name] = {}
        return self[name]

class DummyShowSendalert(object):
    def __init__(self, context, request):
        pass
    show_sendalert = True

from repoze.bfg.security import Authenticated
from repoze.bfg.security import Everyone

class DummySecurityPolicy:
    """ A standin for both an IAuthentication and IAuthorization policy """
    def __init__(self, userid=None, groupids=(), permissions=None):
        self.userid = userid
        self.groupids = groupids
        self.permissions = permissions or {}

    def authenticated_userid(self, request):
        return self.userid

    def effective_principals(self, request):
        effective_principals = [Everyone]
        if self.userid:
            effective_principals.append(Authenticated)
            effective_principals.append(self.userid)
            effective_principals.extend(self.groupids)
        return effective_principals

    def remember(self, request, principal, **kw):
        return []

    def forget(self, request):
        return []

    def permits(self, context, principals, permission):
        if context in self.permissions:
            permissions = self.permissions[context]
            return permission in permissions
        return False

    def principals_allowed_by_permission(self, context, permission):
        return self.effective_principals(None)


class IDummyContent(Interface):
    taggedValue('name', 'dummy')

class DummyContent(testing.DummyModel):
    implements(IDummyContent)
    title = 'THE TITLE'

dummycontent = DummyContent()

class DummySearch:
    def __init__(self, context):
        pass
    def __call__(self, **kw):
        return 1, [1], lambda x: dummycontent

class MyDummyCatalog(dict):    
    def __init__(self):
        self['modified_date'] = DummyModifiedDateIndex()
        class DocumentMap(object):
            def address_for_docid(self, id):
                return '/files/foo/bar'
        self.document_map = DocumentMap()
