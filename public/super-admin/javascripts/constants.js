var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
var mainUrl = location.protocol + '//' + location.hostname + ':' + location.port;

var webservices = {

    //Authenticate
    "authenticate": baseUrl + "/api/adminLogin",
    "forgotPassword": baseUrl + "/api/forgotPassword",

    //Doctors
    "getUserList": baseUrl + "/api/getUserList",
    "addDoctor": baseUrl + "/api/addUser",
    "getSpecialty": baseUrl + "/api/getSpeciality",
    "deleteDoctor": baseUrl + "/api/deleteUser",
    "updateUser": baseUrl + "/api/updateUser",
    "getById": baseUrl + "/api/getById/:id",
    "updateStatus": baseUrl + "/api/updateStatus",
    "updateNetworkProviderStatus": baseUrl + "/api/updateNetworkProviderStatus",
    "getDoctorsList": baseUrl + "/api/getDoctorsList",
    "getDoctorsListUnAssociatedInsurance": baseUrl + "/api/getDoctorsListUnAssociatedInsurance",
    "getDoctorsListAssociatedInsurance": baseUrl + "/api/getDoctorsListAssociatedInsurance",
    "getDoctorsExportList": baseUrl + "/api/getDoctorsExportList",
    "getNonRegDoctorsExportList": baseUrl + "/api/getNonRegDoctorsExportList",
    "getDoctorRatingList": baseUrl + "/api/getDoctorRatingList",
    "resetPassword": baseUrl + "/api/resetPassword",

    //Patients

    "getPatientList": baseUrl + "/api/getPatientList",
    "deletePatient": baseUrl + "/api/deletePatient",
    "updatePatient": baseUrl + "/api/updatePatient",
    "addPatient": baseUrl + "/api/addPatient",
    "getPatientById": baseUrl + "/api/getPatientById/:id",
    "updatePatientStatus": baseUrl + "/api/updatePatientStatus",

    //Specialty

    "getSpecialityList": baseUrl + "/api/getSpecialityList",
    "deleteSpeciality": baseUrl + "/api/deleteSpeciality",
    "updateSpeciality": baseUrl + "/api/updateSpecialityByAdmin",
    "addSpeciality": baseUrl + "/api/addSpeciality",
    "addSpecialityService": baseUrl + "/api/addSpecialityService",
    "getSpecialityById": baseUrl + "/api/getSpecialityById/:id",
    "updateSpecialityStatus": baseUrl + "/api/updateSpecialityStatus",
    "getSpecialityServiceList": baseUrl + "/api/getSpecialityServiceList",
    "specialityServiceDelete": baseUrl + "/api/specialityServiceDelete",
    "specialityServiceStatus": baseUrl + "/api/specialityServiceStatus",
    "updatePatientNotificationStatus": baseUrl + "/api/updatePatientNotificationStatus",


    //Services

    "getServiceList": baseUrl + "/api/getServiceList",
    "getServiceById": baseUrl + "/api/getServiceById/:id",
    "addServices": baseUrl + "/api/addServices",
    "updateServiceStatus": baseUrl + "/api/updateServiceStatus",
    "updateServicesService": baseUrl + "/api/updateServicesService",
    "deleteService": baseUrl + "/api/deleteService",
    "getSpecialityNames": baseUrl + "/api/getSpecialityNames",

    //Insurance network
    'addNetwork': baseUrl + '/api/addNetwork',
    'deleteNetwork': baseUrl + '/api/deleteNetwork',
    'getNetworkList': baseUrl + '/api/getNetworkList',
    'getNetwork': baseUrl + '/api/getNetwork/:id',
    'getUserNetwork': baseUrl + '/api/getUserNetwork/:id',
    'getSelectedNetwork':baseUrl + '/api/getSelectedNetwork/:id',
    // 'insertOrUpdateUsernetworks' : baseUrl + '/api/insertOrUpdateUsernetworks',
    //Title
    'addTitle': baseUrl + '/api/addTitle',
    'deleteTitle': baseUrl + '/api/deleteTitle',
    'getTitleList': baseUrl + '/api/getTitleList',
    'getTitle': baseUrl + '/api/getTitle/:id',

    //Frontdesk Title
    'addFrontdeskTitle': baseUrl + '/api/addFrontdeskTitle',
    'deleteFrontdeskTitle': baseUrl + '/api/deleteFrontdeskTitle',
    // 'getFrontdeskTitleList': baseUrl + '/api/getTitleList',
    'getFrontdeskTitleList' : baseUrl + '/api/getFrontdeskTitles',
    'getFrontdeskTitle': baseUrl + '/api/getFrontdeskTitle/:id',


    //Office Admin

    "addOfficeAdmin": baseUrl + "/api/addUser",
    "getOfficeAdminList": baseUrl + "/api/getOfficeAdminList",
    "deleteOfficeAdmin": baseUrl + "/api/deleteUser",
    "getFrontDeskAdmin": baseUrl + "/api/getFrontDeskAdmin",

    //hospital 
    'addHospital': baseUrl + '/api/addHospital',
    'getHospitalList': baseUrl + '/api/getHospitalList',
    'deleteHospital': baseUrl + '/api/deleteHospital',
    'getHospital': baseUrl + '/api/getHospital/:id',

    //faq 
    'addFaq': baseUrl + '/api/addFaq',
    'getFaqList': baseUrl + '/api/getFaqList',
    'deleteFaq': baseUrl + '/api/deleteFaq',
    'getFaq': baseUrl + '/api/getFaq/:id',

}

var statusCode = {
    "ok": 200,
    "error": 401,
    "failed": 1002,
    "unauth": 1003,
    "internalError": 1004
}

var countryCodes = ['+1', '+91'];
var googleConstants = {
    "google_client_id": "54372597586-09u72notkj8g82vl3jt77h7cbutvr7ep.apps.googleusercontent.com",
}

var appConstants = {
    "authorizationKey": "dGF4aTphcHBsaWNhdGlvbg=="
}


var headerConstants = {
    "json": "application/json"
}

var pagingConstants = {
    "defaultPageSize": 10,
    "defaultPageNumber": 1
}

var messagesConstants = {
    //users
    "saveUser": "User saved successfully",
    "updateUser": "User updated successfully",
    "updateStatus": "Status updated successfully",
    "deleteUser": "User(s) deleted successfully",

    //schools
    "saveSchool": "School saved successfully"
}

/*var degree    = [
                    '',
                    'M.D.',
                    'D.O.',
                    'D.D.S',
                    'D.C.',
                    'O.D.',
                    'ARNP',
                    'RPT',
                    'LMT',
                    'PA-C', 
                    'R.N.', 
                    'J.D.',
                    'Administrator',
                    'Office Manager',
                    'Site Manager',
                    'Equipment Rep',
                    'DME Provider'
                ];*/
/*var officeadminTitle = [
                          '',
                          'Scheduler',
                          'Insurance Coordinator',
                          'Receptionist',
                          'Filing Clerk',
                          'Office Administrator',
                          'Medical Assistant'
                ];  */
/*var degreeForExcel = [
                        '', 
                        'MD',
                        'DO',
                        'DDS',
                        'DC',
                        'OD',
                        'ARNP',
                        'RPT',
                        'LMT',
                        'PA-C',
                        'RN',
                        'JD',
                        'Administrator',
                        'Office Manager',
                        'Site Manager',
                        'Equipment Rep',
                        'DME  Provider'
                    ];*/
var stateList = [
    {
        name: 'ALABAMA',
        abbreviation: 'AL'
    },
    {
        name: 'ALASKA',
        abbreviation: 'AK'
    },
    {
        name: 'AMERICAN SAMOA',
        abbreviation: 'AS'
    },
    {
        name: 'ARIZONA',
        abbreviation: 'AZ'
    },
    {
        name: 'ARKANSAS',
        abbreviation: 'AR'
    },
    {
        name: 'CALIFORNIA',
        abbreviation: 'CA'
    },
    {
        name: 'COLORADO',
        abbreviation: 'CO'
    },
    {
        name: 'CONNECTICUT',
        abbreviation: 'CT'
    },
    {
        name: 'DELAWARE',
        abbreviation: 'DE'
    },
    {
        name: 'DISTRICT OF COLUMBIA',
        abbreviation: 'DC'
    },
    {
        name: 'FEDERATED STATES OF MICRONESIA',
        abbreviation: 'FM'
    },
    {
        name: 'FLORIDA',
        abbreviation: 'FL'
    },
    {
        name: 'GEORGIA',
        abbreviation: 'GA'
    },
    {
        name: 'GUAM',
        abbreviation: 'GU'
    },
    {
        name: 'HAWAII',
        abbreviation: 'HI'
    },
    {
        name: 'IDAHO',
        abbreviation: 'ID'
    },
    {
        name: 'ILLINOIS',
        abbreviation: 'IL'
    },
    {
        name: 'INDIANA',
        abbreviation: 'IN'
    },
    {
        name: 'IOWA',
        abbreviation: 'IA'
    },
    {
        name: 'KANSAS',
        abbreviation: 'KS'
    },
    {
        name: 'KENTUCKY',
        abbreviation: 'KY'
    },
    {
        name: 'LOUISIANA',
        abbreviation: 'LA'
    },
    {
        name: 'MAINE',
        abbreviation: 'ME'
    },
    {
        name: 'MARSHALL ISLANDS',
        abbreviation: 'MH'
    },
    {
        name: 'MARYLAND',
        abbreviation: 'MD'
    },
    {
        name: 'MASSACHUSETTS',
        abbreviation: 'MA'
    },
    {
        name: 'MICHIGAN',
        abbreviation: 'MI'
    },
    {
        name: 'MINNESOTA',
        abbreviation: 'MN'
    },
    {
        name: 'MISSISSIPPI',
        abbreviation: 'MS'
    },
    {
        name: 'MISSOURI',
        abbreviation: 'MO'
    },
    {
        name: 'MONTANA',
        abbreviation: 'MT'
    },
    {
        name: 'NEBRASKA',
        abbreviation: 'NE'
    },
    {
        name: 'NEVADA',
        abbreviation: 'NV'
    },
    {
        name: 'NEW HAMPSHIRE',
        abbreviation: 'NH'
    },
    {
        name: 'NEW JERSEY',
        abbreviation: 'NJ'
    },
    {
        name: 'NEW MEXICO',
        abbreviation: 'NM'
    },
    {
        name: 'NEW YORK',
        abbreviation: 'NY'
    },
    {
        name: 'NORTH CAROLINA',
        abbreviation: 'NC'
    },
    {
        name: 'NORTH DAKOTA',
        abbreviation: 'ND'
    },
    {
        name: 'NORTHERN MARIANA ISLANDS',
        abbreviation: 'MP'
    },
    {
        name: 'OHIO',
        abbreviation: 'OH'
    },
    {
        name: 'OKLAHOMA',
        abbreviation: 'OK'
    },
    {
        name: 'OREGON',
        abbreviation: 'OR'
    },
    {
        name: 'PALAU',
        abbreviation: 'PW'
    },
    {
        name: 'PENNSYLVANIA',
        abbreviation: 'PA'
    },
    {
        name: 'PUERTO RICO',
        abbreviation: 'PR'
    },
    {
        name: 'RHODE ISLAND',
        abbreviation: 'RI'
    },
    {
        name: 'SOUTH CAROLINA',
        abbreviation: 'SC'
    },
    {
        name: 'SOUTH DAKOTA',
        abbreviation: 'SD'
    },
    {
        name: 'TENNESSEE',
        abbreviation: 'TN'
    },
    {
        name: 'TEXAS',
        abbreviation: 'TX'
    },
    {
        name: 'UTAH',
        abbreviation: 'UT'
    },
    {
        name: 'VERMONT',
        abbreviation: 'VT'
    },
    {
        name: 'VIRGIN ISLANDS',
        abbreviation: 'VI'
    },
    {
        name: 'VIRGINIA',
        abbreviation: 'VA'
    },
    {
        name: 'WASHINGTON',
        abbreviation: 'WA'
    },
    {
        name: 'WEST VIRGINIA',
        abbreviation: 'WV'
    },
    {
        name: 'WISCONSIN',
        abbreviation: 'WI'
    },
    {
        name: 'WYOMING',
        abbreviation: 'WY'
    }
];

var states1d = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

var smsTemplateVariables = {
    "reject_referral": [
        {
            "key": "fromSvpFirstname",
            "value": "User firstname"
        },
        {
            "key": "fromSvpLastname",
            "value": "User lastname"
        },
        {
            "key": "fromSvpTitle",
            "value": "User title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Center"
        },
        {
            "key": "rejectReason",
            "value": "Reason for rejection"
        }
    ],
    "referral_toDoc": [
        {
            "key": "toSvpFname",
            "value": "Referred Doctor first Name"
        },
        {
            "key": "toSvpLname",
            "value": "Referred Doctor last name"
        },
        {
            "key": "toSvpTitle",
            "value": "Referred Doctor title"
        },
        {
            "key": "toSvpCenter",
            "value": "Referred Doctor center"
        },
        {
            "key": "fromSvpFname",
            "value": "Referring Doctor first Name"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring Doctor last Name"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring Doctor title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Referring Doctor center"
        },
    ],
    "referral_toPatient": [
        {
            "key": "toSvpFname",
            "value": "Referred Doctor first Name"
        },
        {
            "key": "toSvpLname",
            "value": "Referred Doctor last name"
        },
        {
            "key": "toSvpTitle",
            "value": "Referred Doctor title"
        },
        {
            "key": "toSvpCenter",
            "value": "Referred Doctor Center"
        },
        {
            "key": "fromSvpFname",
            "value": "Referring Doctor first Name"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring Doctor last Name"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring Doctor title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Referring Doctor Center"
        },
        {
            "key": "specname",
            "value": "Doctor specialty"
        },
        {
            "key": "service",
            "value": "Service required"
        },
        {
            "key": "referredProviderAddress",
            "value": "Doctor address"
        },
        {
            "key": "referredProviderPhone",
            "value": "Doctor phone number"
        }
    ]
}

var emailTemplateVariables = {
    "user_register": [{
        "key": "firstname",
        "value": "User Firstname"
    },
    {
        "key": "lastname",
        "value": "User Lastname"
    },
    {
        "key": "title",
        "value": "User Title"
    },
    {
        "key": "email",
        "value": "Login email"
    },
    {
        "key": "gpassword",
        "value": "Login Password"
    },
    {
        "key": "currentYear",
        "value": "Current Year"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    }
    ],
    "user_register_anc": [{
        "key": "lastname",
        "value": "User lastname"
    },
    {
        "key": "email",
        "value": "Login email"
    },
    {
        "key": "gpassword",
        "value": "Login Password"
    },
    {
        "key": "currentYear",
        "value": "Current Year"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    }
    ],
    "forget_password": [{
        "key": "title",
        "value": "title"
    },
    {
        "key": "lastname",
        "value": "User lastname"
    },
    {
        "key": "firstname",
        "value": "User firstname"
    },
    {
        "key": "center",
        "value": "User center"
    },
    {
        "key": "token",
        "value": "Token to be passed with site URL"
    },
    {
        "key": "currentYear",
        "value": "Current Year"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    }
    ],
    "add_user_dynamic_subject": [
        {
            "key": "fromSvpFname",
            "value": "Referring user firstname"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring user lastname"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring user title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Referring center"
        },
        {
            "key": "firstname",
            "value": "User Firstname"
        },
        {
            "key": "lastname",
            "value": "User lastname"
        },
        {
            "key": "title",
            "value": "User title"
        },
        {
            "key": "mailBody",
            "value": "Custom mail body from back-end"
        },
        {
            "key": "email",
            "value": "Login Mail ID"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        },
        {
            "key": "currentYear",
            "value": "Current Year"
        }
    ],
    "add_doc_take_outside_referral": [
        {
            "key": "fromSvpFname",
            "value": "Referring provider firstname"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring provider lastname"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring provider title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Referring center"
        },
        {
            "key": "toSvpFname",
            "value": "Referred provider firstname"
        },
        {
            "key": "toSvpLname",
            "value": "Referred provider lastname"
        },
        {
            "key": "toSvpTitle",
            "value": "Referred provider Title"
        },
        {
            "key": "toSvpCenter",
            "value": "Referred center"
        },
        {
            "key": "email",
            "value": "Login Mail ID"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        },
        {
            "key": "currentYear",
            "value": "Current Year"
        }
    ],
    "add_user_static_subject": [
        {
            "key": "title",
            "value": "Title"
        },
        {
            "key": "lastname",
            "value": "User lastname"
        },
        {
            "key": "firstname",
            "value": "User Firstname"
        },
        {
            "key": "center",
            "value": "Center"
        },
        {
            "key": "fromSvpFname",
            "value": "Referring user firstname"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring user lastname"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring user title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Referring user center"
        },
        {
            "key": "email",
            "value": "Login Mail ID"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        },
        {
            "key": "currentYear",
            "value": "Current Year"
        }
    ],
    "add_frontdesk_user": [
        {
            "key": "lastname",
            "value": "User lastname"
        },
        {
            "key": "firstname",
            "value": "User Firstname"
        },
        {
            "key": "fromSvpFname",
            "value": "Referring user firstname"
        },
        {
            "key": "fromSvpLname",
            "value": "Referring user lastname"
        },
        {
            "key": "fromSvpTitle",
            "value": "Referring user title"
        },
        {
            "key": "email",
            "value": "Login Mail ID"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        },
        {
            "key": "currentYear",
            "value": "Current Year"
        }
    ],
    "reset_password": [{
        "key": "firstname",
        "value": "User firstname"
    },
    {
        "key": "lastname",
        "value": "User lastname"
    },
    {
        "key": "title",
        "value": "User title"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "gpassword",
        "value": "Login Password"
    },
    {
        "key": "currentYear",
        "value": "Current Year"
    }
    ],
    "resend_invite": [{
        "key": "title",
        "value": "Title"
    },
    {
        "key": "lastname",
        "value": "User lastname"
    },
    {
        "key": "firstname",
        "value": "User Firstname"
    },
    {
        "key": "center",
        "value": "User Center"
    },
    {
        "key": "gpassword",
        "value": "New Password"
    },
    {
        "key": "fromSvpFname",
        "value": "Inviting user firstname"
    },
    {
        "key": "fromSvpLname",
        "value": "Inviting user lastname"
    },
    {
        "key": "fromSvpTitle",
        "value": "Inviting user title"
    },
    {
        "key": "fromSvpCenter",
        "value": "Inviting user center"
    },
    {
        "key": "email",
        "value": "Login Mail ID"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "year",
        "value": "Current Year"
    }
    ],
    "refer_referreddoc": [{
        "key": "patientName",
        "value": "Patient Name"
    },
    {
        "key": "toSvpFname",
        "value": "Referred provider first name"
    },
    {
        "key": "toSvpLname",
        "value": "Referred provider last name"
    },
    {
        "key": "toSvpTitle",
        "value": "Referred provider title"
    },
    {
        "key": "toSvpCenter",
        "value": "Referred center"
    },
    {
        "key": "fromSvpFname",
        "value": "Referring provider first name"
    },
    {
        "key": "fromSvpLname",
        "value": "Referring provider last Name"
    },
    {
        "key": "fromSvpTitle",
        "value": "Referring provider title"
    },
    {
        "key": "fromSvpCenter",
        "value": "Referring center"
    },
    {
        "key": "service",
        "value": "Services Referred for"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "year",
        "value": "Current Year"
    }
    ],
    "add_and_refer_referreddoc": [{
        "key": "patientName",
        "value": "Patient Name"
    },
    {
        "key": "toSvpFname",
        "value": "Referred provider first name"
    },
    {
        "key": "toSvpLname",
        "value": "Referred provider last name"
    },
    {
        "key": "toSvpTitle",
        "value": "Referred provider title"
    },
    {
        "key": "toSvpCenter",
        "value": "Referred center"
    },
    {
        "key": "fromSvpFname",
        "value": "Referring provider first name"
    },
    {
        "key": "fromSvpLname",
        "value": "Referring provider last Name"
    },
    {
        "key": "fromSvpTitle",
        "value": "Referring provider title"
    },
    {
        "key": "fromSvpCenter",
        "value": "Referring center"
    },
    {
        "key": "service",
        "value": "Services Referred for"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "year",
        "value": "Current Year"
    }
    ],
    "refer_patient": [{
        "key": "patientName",
        "value": "Patient Name"
    },
    {
        "key": "toSvpFname",
        "value": "Referred provider first Name"
    },
    {
        "key": "toSvpLname",
        "value": "Referred provider last name"
    },
    {
        "key": "toSvpTitle",
        "value": "Referred provider title"
    },
    {
        "key": "toSvpCenter",
        "value": "Referred Center"
    },
    {
        "key": "fromSvpFname",
        "value": "Referring provider first Name"
    },
    {
        "key": "fromSvpLname",
        "value": "Referring provider last Name"
    },
    {
        "key": "fromSvpTitle",
        "value": "Referring provider title"
    },
    {
        "key": "fromSvpCenter",
        "value": "Referring Center"
    },
    {
        "key": "referredProviderAddr",
        "value": "Referred provider address"
    },
    {
        "key": "referredProviderPhone",
        "value": "Referred provider phone"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "year",
        "value": "Current Year"
    }
    ],
    "invite_unregistereddoc": [
        {
            "key": "toSvpFname",
            "value": "Invited provider first name"
        },
        {
            "key": "toSvpLname",
            "value": "Invited provider last name"
        },
        {
            "key": "toSvpTitle",
            "value": "Invited provider title"
        },
        {
            "key": "toSvpCenter",
            "value": "Invited center"
        },
        {
            "key": "fromSvpFname",
            "value": "Frontdesk first name"
        },
        {
            "key": "fromSvpLname",
            "value": "Frontdesk provider last Name"
        },
        {
            "key": "fromSvpTitle",
            "value": "Frontdesk provider title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Frontdesk center"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "email",
            "value": "Login Mail ID"
        },
        {
            "key": "gpassword",
            "value": "New Password"
        }
    ],
    "invite_registereddoc": [
        {
            "key": "toSvpFname",
            "value": "Invited provider first name"
        },
        {
            "key": "toSvpLname",
            "value": "Invited provider last name"
        },
        {
            "key": "toSvpTitle",
            "value": "Invited provider title"
        },
        {
            "key": "toSvpCenter",
            "value": "Invited center"
        },
        {
            "key": "fromSvpFname",
            "value": "Frontdesk first name"
        },
        {
            "key": "fromSvpLname",
            "value": "Frontdesk provider last Name"
        },
        {
            "key": "fromSvpTitle",
            "value": "Frontdesk provider title"
        },
        {
            "key": "fromSvpCenter",
            "value": "Frontdesk center"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        }
    ]
}
var faxTemplateVariables = {
    "add_and_refer_specialist": [
        {
            "key": "firstname",
            "value": "Referred user firstname"
        },
        {
            "key": "lastname",
            "value": "Referred user lastname"
        },
        {
            "key": "title",
            "value": "Referred user title"
        },
        {
            "key": "center",
            "value": "Referred user center"
        },
        {
            "key": "referringProviderFirstname",
            "value": "Referring provider first name"
        },
        {
            "key": "referringProviderLname",
            "value": "Referring provider last name"
        },
        {
            "key": "referringProviderTitle",
            "value": "Referring provider title"
        },
        {
            "key": "referringProviderCenter",
            "value": "Referring provider center"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "email",
            "value": "Login email"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        }
    ],
    "add_specialist": [{
        "key": "firstname",
        "value": "Referred user firstname"
    },
    {
        "key": "lastname",
        "value": "Referred user lastname"
    },
    {
        "key": "title",
        "value": "Referred user title"
    },
    {
        "key": "center",
        "value": "Referred user center"
    },
    {
        "key": "referringProviderFirstname",
        "value": "Referring provider first name"
    },
    {
        "key": "referringProviderLname",
        "value": "Referring provider last name"
    },
    {
        "key": "referringProviderTitle",
        "value": "Referring provider title"
    },
    {
        "key": "referringProviderCenter",
        "value": "Referring provider center"
    },
    {
        "key": "invitingDoc",
        "value": "Inviting doctor lastname."
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "email",
        "value": "Login email"
    },
    {
        "key": "gpassword",
        "value": "Login Password"
    }
    ],
    "resend_invitation": [{
        "key": "lastname",
        "value": "Referred user lastname"
    },
    {
        "key": "firstname",
        "value": "Referred user firstname"
    },
    {
        "key": "title",
        "value": "Referred user title"
    },
    {
        "key": "center",
        "value": "Referred user center"
    },
    {
        "key": "referringProviderFname",
        "value": "Referring provider first name"
    },
    {
        "key": "referringProviderLname",
        "value": "Referring provider last name"
    },
    {
        "key": "referringProviderTitle",
        "value": "Referring provider title"
    },
    {
        "key": "referringProviderCenter",
        "value": "Referring provider center"
    },
    {
        "key": "gpassword",
        "value": "New Password"
    },
    {
        "key": "invitingDoc",
        "value": "Inviting Doctor"
    },
    {
        "key": "webUrl",
        "value": "Site URL"
    },
    {
        "key": "email",
        "value": "Login email"
    },
    {
        "key": "year",
        "value": "Current Year"
    }
    ],
    "add_doc_take_outside_referral": [
        {
            "key": "referringProviderFname",
            "value": "Referring provider firstname"
        },
        {
            "key": "referringProviderLname",
            "value": "Referring provider lastname"
        },
        {
            "key": "referringProviderTitle",
            "value": "Referring provider title"
        },
        {
            "key": "referringProviderCenter",
            "value": "Referring provider center"
        },
        {
            "key": "referredtoProviderFirstname",
            "value": "Referred to provider first name"
        },
        {
            "key": "referredtoProviderLastname",
            "value": "Referred to provider last name"
        },
        {
            "key": "referredtoProviderTitle",
            "value": "Referred to provider title"
        },
        {
            "key": "referredtoProviderCenter",
            "value": "Referred to provider center"
        },
        {
            "key": "webUrl",
            "value": "Site URL"
        },
        {
            "key": "email",
            "value": "Login email"
        },
        {
            "key": "gpassword",
            "value": "Login Password"
        }
    ]

};

// var faqPages = [
//     {
//         pageKey: "doctor_dashboard",
//         pageName: "Doctor Dashboard"
//     },
//     {
//         pageKey: "refer_patient",
//         pageName: "Refer a patient"
//     },
//     {
//         pageKey: "accept_referral",
//         pageName: "Accept a referral"
//     },
// ];

var faqPages = {
    provider_dashboard: "General Dashboard",
    referral_header_dashboard: "Referral Header Dashboard",
    refer_patient: "Refer a patient",
    accept_referral: "Accept a referral",
    provider_list: "Provider List",
    frontdesk_provider_list: "FrontDesk Login - Provider List",
    add_provider: "Add/Edit Provider",
    patient_list: "Patient List",
    add_patient: "Add/Edit Patient",
    rank_provider: "Rank Provider",
    find_whichdocs: "Find Whichdocs",
    search_provider: "Look-up Or Add Provider Or Site",
    add_and_refer: "Add And Refer",
    select_provider: "Refer a patient - Select Provider",
    patient_lookup: "Search For or Add a Patient",
    referal_patient_contact: "Refer a patient - Patient Contact Info",
    add_referring_provider: "Add Referring Provider",
    view_update_provider: "View and Update Provider",
    confirm_speciality: "Confirm Speciality",
    provider_header: "Provider Nav Header",
    frontdesk_header: "FrontDesk Nav Header"

};