const request = require("request");
const helper = require("../helpers");
const _ = require('lodash');

const URL_BASE = `${process.env.APIMEDIC_URL}`;
const URL_LANG = `language=en-gb&`;
const URL_FORMAT = `format=json`;
let URL_TYPE = { symptoms: `symptoms?`, diagnosis: `diagnosis?`};

function get_diagnosis (url, callback) {
    request(url, (err, res, body) => {
        if (err) console.log(err);
        const diagnosis = JSON.parse(body);
        callback(diagnosis);
    })
}

/**
* MAIN Gets Complete Diagnoses Information
* @param {string} _sex Sex of the patient
* @param {string} _age Age of the patient
* @param {array} _symptoms Symptoms of the patient
* @returns {array} Possible Diseases
*/
module.exports = (_sex = "male", _age = "18", _symptoms = ['cough'], context, callback) => {

    var symptoms = _.map(_symptoms, (symptom) => symptom.trim());

    helper.fetch_api_medic_token().then((URL_TOKEN) => {

        URL_TOKEN = `token=${URL_TOKEN}&`;

        let url = `${URL_BASE}${URL_TYPE.symptoms}${URL_TOKEN}${URL_LANG}${URL_FORMAT}`;

        helper.get_symptoms_ids(symptoms, url, ids => {

            const id_string = helper.generate_id_string(ids);
            const URL_SYMPTOMS = `symptoms=[${id_string}]&`;
            const URL_SEX = `gender=${_sex.trim()}&`;
            const URL_AGE = `year_of_birth=${Number(new Date().getFullYear()) - _age.trim()}&`;

            url = `${URL_BASE}${URL_TYPE.diagnosis}${URL_TOKEN}${URL_SYMPTOMS}${URL_SEX}${URL_AGE}${URL_LANG}${URL_FORMAT}`;

            get_diagnosis(url, body => {

                let issues = [];
                body.forEach(object => {
                    issues.push(object);
                })

                callback(null, issues);
            });
        })
    });
};
