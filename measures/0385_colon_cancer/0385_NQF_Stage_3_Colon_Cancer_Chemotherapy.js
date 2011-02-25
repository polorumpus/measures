function () {
  var patient = this;
  var measure = patient.measures["0385"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var latest_birthdate = effective_date - 18*year;
  var earliest_encounter = effective_date - 1*year;
  var latest_encounter = maxInRange(measure.encounter_office_visit_encounter, earliest_encounter, effective_date);
  
  var population = function() {
    var age_match = patient.birthdate <= latest_birthdate;
    if (!latest_encounter)
      return false;
    var colon_cancer = lessThan(measure.colon_cancer_diagnosis_active, latest_encounter); 
    var colon_cancer_history = lessThan(measure.colon_cancer_history_diagnosis_inactive, latest_encounter);
    var encounter_count = inRange(measure.encounter_office_visit_encounter, earliest_encounter, effective_date);
    return age_match && (colon_cancer || colon_cancer_history) && (encounter_count>1);
  }
  
  var denominator = function() {
    var colon_cancer_iii = lessThan(measure.colon_cancer_stage_iii_procedure_result, latest_encounter); 
    return colon_cancer_iii;
  }
  
  var numerator = function() {
    var chemo_dates = _.flatten([measure.chemotherapy_for_colon_cancer_medication_order, measure.chemotherapy_for_colon_cancer_medication_administered]);
    var chemo = lessThan(chemo_dates, latest_encounter);
    return chemo;
  }
  
  var exclusion = function() {
    var metastatic_sites = lessThan(measure.metastatic_sites_common_to_colon_cancer_diagnosis_active, latest_encounter);
    var renal_isufficiency = lessThan(measure.acute_renal_insufficiency_diagnosis_active, latest_encounter);
    var neutropenia = lessThan(measure.neutropenia_diagnosis_active, latest_encounter);
    var leukopenia = lessThan(measure.leukopenia_diagnosis_active, latest_encounter);
    var ecog = lessThan(measure.ecog_performance_status_poor_patient_characteristic, latest_encounter);
    var allergy = lessThan(measure.chemotherapy_for_colon_cancer_medication_allergy, latest_encounter);
    var medical = inRange(measure.medical_reason_medication_not_done, earliest_encounter, effective_date);
    var patient = inRange(measure.patient_reason_medication_not_done, earliest_encounter, effective_date);
    var system = inRange(measure.system_reason_medication_not_done, earliest_encounter, effective_date);
    return metastatic_sites || renal_isufficiency || neutropenia || leukopenia || ecog || allergy
      || medical || patient || system;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};