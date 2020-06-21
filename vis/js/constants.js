const classLabs = [
    "Unacceptable",
    "Acceptable",
    "Good"
];
const classLabsAbbrev = [
    "Unacc.",
    "Acc.",
    "Good"
];
const classLevels = [
    "unacceptable",
    "acceptable",
    "good"
];
const features = [
    'buying price',
    'maintanence price',
    'luggage boot size',
    'estimated safety',
    'doors',
    'capacity (persons)'
];
const featureAbbrevs = {
    'buying price': 'buy price',
    'maintanence price': 'maint. price',
    'luggage boot size': 'lugg. size',
    'estimated safety': 'safety',
    'doors': 'doors',
    'capacity (persons)': 'capacity'
};
const encodedLevels = {
    'buying price': [0, 1, 2, 3],
    'maintanence price': [0, 1, 2, 3],
    'luggage boot size': [0, 1, 2],
    'estimated safety': [0, 1, 2],
    'doors': [2, 3, 4, 5],
    'capacity (persons)': [2, 4, 5]
};
const levels = {
    'buying price': ['low', 'med', 'high', 'vhigh'],
    'maintanence price': ['low', 'med', 'high', 'vhigh'],
    'luggage boot size': ['small', 'med', 'big'],
    'estimated safety': ['low', 'med', 'high'],
    'class': ['unacc', 'acc', 'good'],
    'doors': ['2', '3', '4', '5more'],
    'capacity (persons)': ['2', '4', 'more']
};
const levelNames = {
    'med': 'medium',
    'vhigh': 'very high',
    'acc': 'acceptable',
    'unacc': 'unacceptable',
    'vgood': 'very good',
    '5more': '5+',
    'more': '5+'
};
//
// INSERT INTO `arrangements` (`arrangement_id`, `participant_id`, `question_id`, `reward`, `choice`, `arrangement`, `variant`) VALUES ('0', '-1', '-1', NULL, NULL, '{\"meta\":{\"height\":12,\"width\":12,\"n_architectures\":1,\"n_components\":5},\"architectures\"::[{\"id\": 1325, \"height\": 12, \"width\": 12, \"components\": {\"id\": -1, \"height\": 1, \"width\": 1.0, \"orientation\": \"v\", \"left_child\": {\"id\": -1, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {\"id\": 1.0, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {\"id\": 5.0, \"height\": 1.0, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {}}}, \"right_child\": {\"id\": -1, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {\"id\": 2.0, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {\"id\": 4.0, \"height\": 1.0, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {}}}}}],\"scores\":[]}', '1');
// INSERT INTO `arrangements` (`arrangement_id`, `participant_id`, `question_id`, `reward`, `choice`, `arrangement`, `variant`) VALUES (NULL, '-1', '-1', NULL, NULL, '{\"meta\":{\"height\":12,\"width\":12,\"n_architectures\":1,\"n_components\":5},\"architectures\":[{\"id\": 1729, \"height\": 12, \"width\": 12, \"components\": {\"id\": -1, \"height\": 1, \"width\": 1.0, \"orientation\": \"v\", \"left_child\": {\"id\": 2.0, \"height\": 1, \"width\": 0.3333333333333333, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 1, \"width\": 0.6666666666666667, \"orientation\": \"v\", \"left_child\": {\"id\": 1.0, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {\"id\": 4.0, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {\"id\": 5.0, \"height\": 1, \"width\": 1.0, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {}}}}}}],\"scores\":[]}', '2');
// INSERT INTO `arrangements` (`arrangement_id`, `participant_id`, `question_id`, `reward`, `choice`, `arrangement`, `variant`) VALUES (NULL, '-1', '-1', NULL, NULL, '{\"meta\":{\"height\":12,\"width\":12,\"n_architectures\":1,\"n_components\":5},\"architectures\":[{\"id\": 1730, \"height\": 12, \"width\": 12, \"components\": {\"id\": -1, \"height\": 1, \"width\": 1.0, \"orientation\": \"v\", \"left_child\": {\"id\": 2.0, \"height\": 1, \"width\": 0.3333333333333333, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 1, \"width\": 0.6666666666666667, \"orientation\": \"v\", \"left_child\": {\"id\": 5.0, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 0.5, \"width\": 1, \"orientation\": \"h\", \"left_child\": {\"id\": 4.0, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {\"id\": -1, \"height\": 1, \"width\": 0.5, \"orientation\": \"v\", \"left_child\": {\"id\": 1.0, \"height\": 1, \"width\": 1.0, \"orientation\": \"v\", \"left_child\": {}, \"right_child\": {}}, \"right_child\": {}}}}}}],\"scores\":[]}', '3');