"""
=========================
Karl user synchronization
=========================

This document specifies a means of synchronizing users to Karl from an external
data source.  The external data source will make user data available in JSON
format at a particular URL.  The Karl user sync script will be download JSON
data from the external URL and use that data to: create new users, update
existing users, deactivate or reactivate existing users.  Note there is no
facility to delete a user from Karl.  This is a limitation of Karl and not of
the user sync facility.

JSON file format
----------------

The top level of the JSON data used by sync is a mapping with one required key
and two optional keys::

    {
        "timestamp": "2010-05-12T02:42:00",
        "deactivate_missing": false,
        "users": [
            ...
         ]
     }

The `timestamp` key is optional.  If provided it will be used on subsequent
requests to construct a query string appended to the URL used to download data.
If the URL where user data is provided is "http://example.com/users/", then the
first time user sync is done that URL will be called as-is.  If the
JSON data returned contains a `timestamp` key, the value of that key will be
used to construct a new URL:
"http://example.com/users/?timestamp=2010-05-12T2:42:00".

The format of the timestamp value is not important to Karl.  It will simply be
returned verbatim to the user data source.  It doesn't even technically have to
be a timestamp.  It could be a serial transaction id or anything else useful to
the user data source for knowing which data the Karl system has already seen.
It is the responsibility of the user data source to interpret the timestamp
such that only user data which has changed since the time indicated by the
timestamp is retunred to the Karl system.

Use of the timestamp is entirely optional for the user data source.

The `deactivate_missing` key, if provided and `true`, will cause Karl to
deactivate any users missing from the user data upload that are managed by the
user sync facility.  Karl keeps track of which users are managed by
the sync facility.  If a user is added to Karl by another avenue
and does not subsequently appear in any sync data, that user will not
be deactivated by the sync facility.

The `deactivate_missing` should not be set to `true` if the timestamp facility
is used.  Since use of the timestamp facility implies only a subset of user data
may be sent at any one time, then presence or absence of a user record can't be
used as a means of driving a decision to deactivate.  In this case, the
preferred method of deactivating a user using the sync facility is to set the
`active` key of the user record to `false`.

The `users` key is required and contains a sequence of user records.

User Records
------------

Each user record is a mapping.  Which keys are required depend on whether the
user is already in the sysem.  If a user is already in the system, only the
`username` key is required.  If a user is being added to the system, the
`first_name`, `last_name`, `email`, and `password` keys are also required.  Any
key missing from a record will not be changed by the sync facility.

The following keys may appear in a user record:

o `username` This key is always required.  The unique identifier for this user
  in the system.

o `first_name` The user's given name.  Required for new users.

o `last_name` The user's surname.  Required for new users.

o `email` The user's email address.  Required for new users.

o `password` This key is required only for new users.  Passwords must be SHA1
  hashed.  Required for new users.

o `login` This is the name used by users to login to Karl at the login page.
  It is presumed to be `username` if not specified.

o `groups` This is a list of groups the user should be added to in Karl.  Valid
  groups are: `group.KarlAdmin`, `group.KarlStaff`, `group.KarlUserAdmin`,
  `group.KarlCommunications`.

o `communities` This is a list of communities the user should be made a member
  of.  Communities should be specified by their paths within Karl, e.g.:
  `/communities/human-resources` or `/offices/budapest`.

o `active` Whether or not the user is active in the system.  Presumed `true`
  if not provided.  Set this to `false` to deactivate a user.

o `phone` The user's phone number.

o `extension` The user's phone extension.

o `fax` The user's fax number.

o `department` The user's department.

o `position` The user's professional title.

o `organization` The user's organization.

o `location` The user's location.

o `country` The user's country.

o `websites` List of the user's websites.

o `languages` List of languages the user speaks.

o `office` The user's office.

o `room_no` The user's room number.

o `biography` Long form text about the user.

o `date_format` The user's preferred date format.  Use `en-US` for United States
  date format, or `en-GB` for European date format.  If all users use the same
  date format, the default can be specified globally for the entire Karl
  instance, rather than per user in the sync.

o `home_path` The path in Karl to the user's 'home'.  Should usually not be
  specified.

The following is an example of JSON data that could be returned from the user
data source.  Note that `wilma` and `dino` must already be Karl users::

    {
        "timestamp": "348ea92",
        "users": [
            {
                "username": "fred",
                "password": "SHA1:d033e22ae348aeb5660fc2140aec35850c4da997",
                "first_name": "Fred",
                "last_name": "Flintstone",
                "email": "fred@bedrock.town"
            },
            {
                "username": "barney",
                "password": "SHA1:d033e22ae348aeb5660fc2140aec35850c4da997",
                "first_name": "Barney",
                "last_name": "Rubble",
                "email": "barney@bedrock.town"
            },
            {
                "username": "wilma",
                "last_name": "Flintstone"
            },
            {
                "username": "dino",
                "active": false
            }
        ],
        "deactivate_missing": false
    }
"""
