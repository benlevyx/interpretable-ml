const classLabs = [
    "Unacceptable",
    "Acceptable",
    "Good",
    "Very good"
];
const classLabsAbbrev = [
    "Unacc.",
    "Acc.",
    "Good",
    "V. good"
];
const classLevels = [
    "unacceptable",
    "acceptable",
    "good",
    "vgood"
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
    'class': ['unacc', 'acc', 'good', 'vgood'],
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