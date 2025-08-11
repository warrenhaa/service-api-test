const { v4: uuidV4 } = require('uuid');

const clpConvert = function (jsondata) {
    var g_index = 0;
    var config =
    {
        "configVersion": "00_00_00-2016-04-23-b-",
        "keepLogForMilliseconds": 2 * 60 * 60 * 1000, // 2 hours ONLY TODO: lengthen this again!
        "keepPresenceLogForMilliseconds": 8 * 24 * 60 * 60 * 1000, // TODO: not used yet, use this in presence Log
        "tabTemplate": "    ",
        "conditionTemplateByOp": {
            "AND": {
                //"template" : "\n#indentLevel##nextErrorHere#(and (eq 1 1)#nextParameterHere#\n#indentLevel#)",
                "template": "\n#indentLevel##nextErrorHere#(and #nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 100
            },
            "BIT": {
                "template": "\n#indentLevel##nextErrorHere#(bit#nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 100
            },
            "TRUE": {
                "template": "\n#indentLevel##nextErrorHere#(eq 1 1)",
                "minParameters": 0,
                "maxParameters": 100
            },
            "FALSE": {
                "template": "\n#indentLevel##nextErrorHere#(eq 1 0)",
                "minParameters": 0,
                "maxParameters": 100
            },
            "OR": {
                //"template" : "\n#indentLevel##nextErrorHere#(or (eq 1 0)#nextParameterHere#\n#indentLevel#)",
                "template": "\n#indentLevel##nextErrorHere#(or #nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 100
            },
            "NOT": {
                //"template" : "\n#indentLevel##nextErrorHere#(not#nextParameterHere#)",
                "template": "\n#indentLevel##nextErrorHere#(not#nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 1
            },
            "EQ": {
                "template": "\n#indentLevel##nextErrorHere#(eq#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "NEQ": {
                "template": "\n#indentLevel##nextErrorHere#(neq#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "STR-INDEX": {
                "template": "\n#indentLevel##nextErrorHere#(str-index#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "LT": {
                "template": "\n#indentLevel##nextErrorHere#(lt#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "GT": {
                "template": "\n#indentLevel##nextErrorHere#(gt#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "LTE": {
                "template": "\n#indentLevel##nextErrorHere#(elt#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "GTE": {
                "template": "\n#indentLevel##nextErrorHere#(egt#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "BWT": {
                "template": "\n#indentLevel##nextErrorHere#(bwt#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 2
            },
            "REPEAT": {
                "template": "\n#indentLevel##nextErrorHere#(repeat#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "ADD": {
                //"template" : "\n#indentLevel##nextErrorHere#(str-cat \"\" (+#nextParameterHere#))", //remark by sannyzhang 20250210            
                "template": "\n#indentLevel##nextErrorHere#(+#nextParameterHere#)",  //add by sannyzhang 20250210
                "minParameters": 2,
                "maxParameters": 100
            },
            "GetValue": {
                "template": "#nextErrorHere# ?#propertyNameHere#",
                "minParameters": 2,
                "maxParameters": 2
            },
            "ValueChanged": {
                "template": "\n#indentLevel##nextErrorHere#(neq ?#propertyNameHere# ?#propertyNameHere#Old)\n",
                "minParameters": 2,
                "maxParameters": 2
            },
            "GetOldValue": {
                "template": "#nextErrorHere# ?#propertyNameHere#Old",
                "minParameters": 2,
                "maxParameters": 2
            },
            "GetValueChangedTime": {
                "template": "#nextErrorHere# ?#propertyNameHere#Detected",
                "minParameters": 2,
                "maxParameters": 2
            },
            "Number": {
                "template": "#nextErrorHere# #constantHere#",
                "minParameters": 1,
                "maxParameters": 1
            },
            "String": {
                "template": "#nextErrorHere# #constantHere#",
                "minParameters": 1,
                "maxParameters": 1
            },
            "QuotedString": {
                "template": "#nextErrorHere# \"#constantHere#\"",
                "minParameters": 1,
                "maxParameters": 1
            },
            "BAND": {
                "template": "\n#indentLevel##nextErrorHere#(band#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "sub-string": {
                "template": "\n#indentLevel##nextErrorHere#(sub-string#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "SUB": {
                "template": "\n#indentLevel##nextErrorHere#(-#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "MUL": {
                "template": "\n#indentLevel##nextErrorHere#(*#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "DIV": {
                "template": "\n#indentLevel##nextErrorHere#(/#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "MAX": {
                "template": "\n#indentLevel##nextErrorHere#(max#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "MIN": {
                "template": "\n#indentLevel##nextErrorHere#(min#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "LAND": {
                "template": "\n#indentLevel##nextErrorHere#(land#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "LOR": {
                "template": "\n#indentLevel##nextErrorHere#(lor#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "LNOT": {
                "template": "\n#indentLevel##nextErrorHere#(lnot#nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 1
            },
            "BOR": {
                "template": "\n#indentLevel##nextErrorHere#(bor#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "BXOR": {
                "template": "\n#indentLevel##nextErrorHere#(bxor#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "BNOT": {
                "template": "\n#indentLevel##nextErrorHere#(bnot#nextParameterHere#)",
                "minParameters": 1,
                "maxParameters": 1
            },
            "SUBDEC": {
                "template": "\n#indentLevel##nextErrorHere#(subdec#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "SUBHEX": {
                "template": "\n#indentLevel##nextErrorHere#(subhex#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            },
            "SUBSYM": {
                "template": "\n#indentLevel##nextErrorHere#(subsym#nextParameterHere#)",
                "minParameters": 2,
                "maxParameters": 100
            }
        },
        "actionTemplateByOp": {
            "SetValue": {
                "templateArray": [
                    "#nextErrorHere#",
                    "#tab#(assert (Queue (EUID \"E#p0#\") (Name \"#p1#\") (Value \"#p2#\")))\n"
                ],
                "minParameters": 3,
                "maxParameters": 3
            },
            "CancelTimer": {
                "templateArray": [
                    "#nextErrorHere#",
                    "#tab#(assert (Queue (EUID \"E#p0#\") (Name \"#p1#\") (Value \"NULL\")))\n"
                ],
                "minParameters": 2,
                "maxParameters": 2
            },
            "StartTimer": {
                "templateArray": [
                    "#nextErrorHere#",
                    "#tab#(bind ?TimerActived (str-cat \"\" (+ ?#propertyNameHere# #p1#)))\n",
                    "#tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"ep_0:sRule:TimerActived_#p2#\") (Value ?TimerActived)))\n"
                ],
                "minParameters": 3,
                "maxParameters": 3
            }
        },
        "ruleFileTemplateArray": [
            "\n",
            "#nextErrorHere#",
            "(deftemplate Property\n",
            "#tab#(slot EUID)\n",
            "#tab#(slot Name)\n",
            "#tab#(slot OldValue)\n",
            "#tab#(slot Value)\n",
            "#tab#(slot Detected)\n",
            ")\n",
            "(deftemplate Queue\n",
            "#tab#(slot EUID)\n",
            "#tab#(slot Name)\n",
            "#tab#(slot Value)\n",
            ")\n",
            "#nextSingleControlRuleHere#",
            "#nextRuleHere#",
            "(defrule Return-Property-Change\n",
            "#tab#(declare (salience -1000))\n",
            "#tab#(Queue (EUID ?EUID) (Name ?Name) (Value ?Value))\n",
            "#tab#=>\n",
            "#tab#(CLIPSReturn ?EUID ?Name ?Value)\n",
            ")\n",
            "(defrule The-End\n",
            "#tab#(declare (salience -2000))\n",
            "#tab#=>\n",
            "#tab#(CLIPSReturn \"TheEnd\" \"\" \"\")\n",
            ")\n"
        ],
        // Hi Duppy,
        //
        // For all rules about single control, would you please update as below (blue),    in order to only assert to the value which is not equal with newGroupValue:
        //
        // (defrule LinkedRuleKey-nynlJmF_SP67jV67eHKpCzvLZ1y8Hz5qHzYhlJhVFaQ_i2 "iT600 Groupep_9:sIT600TH:HoldType"
        //     (Property (EUID E000d6f00030558f9) (Name ep_9:sIT600TH:HoldType) (OldValue ?V1Old) (Value ?V1) (Detected ?V1Detected))
        //     (Property (EUID E000d6f000402c2c1) (Name ep_9:sIT600TH:HoldType) (OldValue ?V2Old) (Value ?V2) (Detected ?V2Detected))
        //     (test (eq 1 1))
        //     =>
        //     (bind ?newGroupValue NULL)
        //     (bind ?newestDetected NULL)
        //     (if (neq ?V1Old ?V1) then
        //         (if (and (neq ?newGroupValue NULL) (gt ?newestDetected ?V1Detected))
        //             then 1
        //             else (bind ?newGroupValue ?V1) (bind ?newestDetected ?V1Detected)
        //         )
        //     )
        //     (if (neq ?V2Old ?V2) then
        //         (if (and (neq ?newGroupValue NULL) (gt ?newestDetected ?V2Detected))
        //             then 1
        //             else (bind ?newGroupValue ?V2) (bind ?newestDetected ?V2Detected)
        //         )
        //     )
        //< < < < CHANGE THIS OLD METHOD
        //     (if (neq ?newGroupValue NULL) then
        //         (assert (Queue (EUID "E000d6f00030558f9") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
        //         (assert (Queue (EUID "E000d6f000402c2c1") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
        //     )
        //< < < < To new test for each assert
        //    (if (and (neq ?newGroupValue NULL) (neq ?newGroupValue ?V1)) then                                                                                                                                                                        ; —> add
        //         (assert (Queue (EUID "E000d6f00030558f9") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
        //    )
        //    (if (and (neq ?newGroupValue NULL) (neq ?newGroupValue ?V2)) then
        //         (assert (Queue (EUID "E000d6f000402c2c1") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
        //    )
        // )
        //
        // Best regards,
        // Kairy
        /**********************
        CHANGE REQUEST 2016-04-20
        (defrule LinkedRuleKey-ddddddd_SP67jV67eHKpCzvLZ1y8Hz5qHzYhlJhVFaQ_i2 "iT600 Groupep_9:sIT600TH:HoldType”                    —> It is the first rule
            (Property (EUID E1111111111111111) (Name ep_9:sIT600TH:HoldType) (OldValue ?V1Old) (Value ?V1) (Detected ?V1Detected))
            (Property (EUID E2222222222222222) (Name ep_9:sIT600TH:HoldType) (OldValue ?V2Old) (Value ?V2) (Detected ?V2Detected))
            (Property (EUID E3333333333333333) (Name ep_9:sIT600TH:HoldType) (OldValue ?V3Old) (Value ?V3) (Detected ?V3Detected))
            (Property (EUID E4444444444444444) (Name ep_9:sIT600TH:HoldType) (OldValue ?V4Old) (Value ?V4) (Detected ?V4Detected))
            (test (eq 1 1))
            =>
            (bind ?newGroupValue NULL)
            (bind ?newestDetected 0)                            —>    0 instead of NULL
            (if (not (eq ?V1 ?V2 ?V3 ?V4)) then         —> not eq in stead of eq
            (if (and (lt ?newestDetected ?V1Detected)(neq ?V1 1)) then            —> lt instead of >， delete (neq ?newGroupValue NULL),    add HoldType<>temporary hold (1)
                (bind ?newGroupValue ?V1) (bind ?newestDetected ?V1Detected)
            )
             (if (and (lt ?newestDetected ?V2Detected)(neq ?V2 1)) then
                (bind ?newGroupValue ?V2) (bind ?newestDetected ?V2Detected)
            )
            (if (and (lt ?newestDetected ?V3Detected)(neq ?V3 1)) then
                (bind ?newGroupValue ?V3) (bind ?newestDetected ?V3Detected)
            )
            (if (and (lt ?newestDetected ?V4Detected)(neq ?V4 1)) then
                (bind ?newGroupValue ?V4) (bind ?newestDetected ?V4Detected)
            )
            (if (and (neq ?newGroupValue ?V1) then     —>    delete (neq ?newGroupValue NULL)
                (assert (Queue (EUID "E1111111111111111") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
            )
            (if    (neq ?newGroupValue ?V2) then
                (assert (Queue (EUID "E2222222222222222") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
            )
            (if (neq ?newGroupValue ?V3) then
                (assert (Queue (EUID "E3333333333333333") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
            )
            (if (neq ?newGroupValue ?V4) then
                (assert (Queue (EUID "E4444444444444444") (Name "ep_9:sIT600TH:SetHoldType") (Value ?newGroupValue)))
            )
            )
        )
        
        (defrule LinkedRuleKey-ddddddd_SP67jV67eHKpCzvLZ1y8Hz5qHzYhlJhVFaQ_i2 "iT600 Groupep_9:sIT600TH:MaxHeatingSetpoint_x100”     —> It is the 2nd rule
            (Property (EUID E1111111111111111) (Name ep_9:sIT600TH:MaxHeatingSetpoint_x100) (OldValue ?V1Old) (Value ?V1) (Detected ?V1Detected))
            (Property (EUID E2222222222222222) (Name ep_9:sIT600TH:MaxHeatingSetpoint_x100) (OldValue ?V2Old) (Value ?V2) (Detected ?V2Detected))
            (Property (EUID E3333333333333333) (Name ep_9:sIT600TH:MaxHeatingSetpoint_x100) (OldValue ?V3Old) (Value ?V3) (Detected ?V3Detected))
            (Property (EUID E4444444444444444) (Name ep_9:sIT600TH:MaxHeatingSetpoint_x100) (OldValue ?V4Old) (Value ?V4) (Detected ?V4Detected))
            (test (eq 1 1))
            =>
            (bind ?newGroupValue NULL)
            (bind ?newestDetected 0)                            —> 0 instead of NULL
            (if (neq ?V1 ?V2 ?V3 ?V4) then         —> neq instead of eq
             (if (lt ?newestDetected ?V1Detected) then            —> lt instead of >， delete (neq ?newGroupValue NULL)
                (bind ?newGroupValue ?V1) (bind ?newestDetected ?V1Detected)
            )
            (if (lt ?newestDetected ?V2Detected) then
                (bind ?newGroupValue ?V2) (bind ?newestDetected ?V2Detected)
            )
             (if (lt ?newestDetected ?V3Detected) then
                (bind ?newGroupValue ?V3) (bind ?newestDetected ?V3Detected)
            )
             (if (lt ?newestDetected ?V4Detected) then
                (bind ?newGroupValue ?V4) (bind ?newestDetected ?V4Detected)
            )
             (if (neq ?newGroupValue ?V1) then     —>    delete (neq ?newGroupValue NULL)
                (assert (Queue (EUID "E1111111111111111") (Name "ep_9:sIT600TH:SetMaxHeatingSetpoint_x100") (Value ?newGroupValue)))
            )
            (if    (neq ?newGroupValue ?V2) then
                (assert (Queue (EUID "E2222222222222222") (Name "ep_9:sIT600TH:SetMaxHeatingSetpoint_x100") (Value ?newGroupValue)))
            )
            (if (neq ?newGroupValue ?V3) then
                (assert (Queue (EUID "E3333333333333333") (Name "ep_9:sIT600TH:SetMaxHeatingSetpoint_x100") (Value ?newGroupValue)))
            )
            (if (neq ?newGroupValue ?V4) then
                (assert (Queue (EUID "E4444444444444444") (Name "ep_9:sIT600TH:SetMaxHeatingSetpoint_x100") (Value ?newGroupValue)))
            )
            )
        )
        
        
        
        
        
        **********************/
        "linkedDeviceRuleTemplateArray": [
            "#nextErrorHere#",
            "(defrule LinkedRuleKey-#ruleKeyStringHere# \"#ruleNameStringHere#\"\n",
            "#nextBindValueHere#",
            "#tab#(test (egt ?V#linkTimeHere# (+ ?V#ruleTimeHere# 2)))\n",
            "#tab#=>\n",
            "#tab#(bind ?newGroupValue NULL)\n",
            "#tab#(bind ?newestDetected 0)\n",
            "#nextLinkedDeviceCheckHere#",
            "#nextLinkedDeviceAssertHere#",
            //      "#tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"ep_0:sRule:SetRuleFired\") (Value \"#partRuleKeyHere#\")))\n",
            ")\n"
        ],
        "linkedDeviceAssertTemplateArray": [
            "#nextErrorHere#",
            "#tab#(if (and (neq ?newGroupValue NULL) (neq ?newGroupValue ?#propertyNameHere#)) then\n",
            "#tab##tab#(assert (Queue (EUID \"E#euidHere#\") (Name \"#assertNameHere#\") (Value ?newGroupValue)))\n",
            "#tab##tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"#ruleNameHere#\") (Value ?V#linkTimeHere#)))\n", //sean add 2017/-6/19
            "#tab##tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"#assertRuleKeyHere#\") (Value \"#partRuleKeyHere#\")))\n",
            "#tab#)\n"
        ],
        "linkedDeviceAssertSpecialArray": [
            "#nextErrorHere#",
            "#tab#(if (and (neq ?newGroupValue ?#propertyNameHere#) (neq ?newGroupValue 1) (neq ?newGroupValue NULL)) then\n",
            "#tab##tab#(assert (Queue (EUID \"E#euidHere#\") (Name \"#assertNameHere#\") (Value ?newGroupValue)))\n",
            "#tab##tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"#ruleNameHere#\") (Value ?V#linkTimeHere#)))\n", //sean add 2017/-6/19
            "#tab##tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"#assertRuleKeyHere#\") (Value \"#partRuleKeyHere#\")))\n",
            "#tab#)\n"
        ],

        "linkedDeviceSpecialCheckPart": [//sean-add 6-10
            "#nextErrorHere#",
            "#tab##tab#(if (lt ?newestDetected ?#propertyNameHere#Detected) then\n",
            "#tab##tab##tab#(bind ?newGroupValue ?#propertyNameHere#) (bind ?newestDetected ?#propertyNameHere#Detected)\n",
            "#tab##tab#)\n"
        ],

        "linkedDeviceCheckPart": [//sean-add 6-10
            "#nextErrorHere#",
            "#tab##tab#(if (lt ?newestDetected ?#propertyNameHere#Detected) then\n",
            "#tab##tab##tab#(bind ?newGroupValue ?#propertyNameHere#) (bind ?newestDetected ?#propertyNameHere#Detected)\n",
            "#tab##tab#)\n"
        ],
        "linkedDeviceCheckTemplateArray": [ //sean-add 6-10
            "#nextErrorHere#",
            "#tab#(if (not (eq ?#nextPropertyNameHere#)) then\n",
            "#nextLinkedDeviceCheckPartHere#",
            "#tab#)\n"
        ],

        "linkedDeviceCheckTemplateArray-old": [
            "#nextErrorHere#",
            "#tab#(if (neq ?#propertyNameHere#Old ?#propertyNameHere#) then\n",
            "#tab##tab#(if (and (neq ?newGroupValue NULL) (gt ?newestDetected ?#propertyNameHere#Detected))\n",
            "#tab##tab##tab#then 1\n",
            "#tab##tab##tab#else (bind ?newGroupValue ?#propertyNameHere#) (bind ?newestDetected ?#propertyNameHere#Detected)\n",
            "#tab##tab#)\n",
            "#tab#)\n"
        ],
        "linkedDeviceCheckSpecialCaseTemplateArray": [
            "#nextErrorHere#",
            "#tab#(if (and (neq ?#propertyNameHere#Old ?#propertyNameHere#)\n",
            "#tab##tab##tab#(neq ?#propertyNameSpecialCaseHere# 0)) then\n",
            "#tab##tab#(if (and (neq ?newGroupValue NULL) (gt ?newestDetected ?#propertyNameHere#Detected))\n",
            "#tab##tab##tab#then 1\n",
            "#tab##tab##tab#else (bind ?newGroupValue ?#propertyNameHere#) (bind ?newestDetected ?#propertyNameHere#Detected)\n",
            "#tab##tab#)\n",
            "#tab#)\n"
        ],
        "linkedDeviceCheckUseSpecialCaseByPropertyName": {
            "ep_9:sTherS:CoolingSetpoint_x100": "ep_9:sTherS:Hold",
            "ep_9:sTherS:HeatingSetpoint_x100": "ep_9:sTherS:Hold"
        },
        /*
            For iT600 thermostat, any of below properties (in left) changed, the corresponding SetXXX properties (in right) should be set to the linked devices:
        ep_9:sIT600TH:CoolingSetpoint_x100 ep_9:sIT600TH:SetCoolingSetpoint_x100
        ep_9:sIT600TH:HeatingSetpoint_x100 ep_9:sIT600TH:SetHeatingSetpoint_x100
        ep_9:sIT600TH:AutoCoolingSetpoint_x100 ep_9:sIT600TH:AutoSetCoolingSetpoint_x100
        ep_9:sIT600TH:AutoHeatingSetpoint_x100 ep_9:sIT600TH:AutoSetHeatingSetpoint_x100
        ep_9:sIT600TH:HoldType    ep_9:sIT600TH:SetHoldType
        
        For Optima thermostat:
        ep_9:sTherS:CoolingSetpoint_x100 ep_9:sTherS:SetCoolingSetpoint_x100
        ep_9:sTherS:HeatingSetpoint_x100 ep_9:sTherS:SetHeatingSetpoint_x100
        ep_9:sTherS:AutoCoolingSetpoint_x100 ep_9:sTherS:AutoSetCoolingSetpoint_x100
        ep_9:sTherS:AutoHeatingSetpoint_x100 ep_9:sTherS:AutoSetHeatingSetpoint_x100
        ep_9:sTherS:SystemMode        ep_9:sTherS:SetSystemMode
        ep_9:sTherS:HoldDuration ep_9:sTherS:SetHoldDuration
        ep_9:sFanS:FanMode     ep_9:sFanS:SetFanMode
        
        Hi Duppy,
        
        We want to delete some properties in Single Control, please update single control rule as below, thanks!
        
        For iT600 thermostat, any of below properties (in left) changed, the corresponding SetXXX properties (in right) should be set to the linked devices:
        ep_9:sIT600TH:CoolingSetpoint_x100 ep_9:sIT600TH:SetCoolingSetpoint_x100
        ep_9:sIT600TH:HeatingSetpoint_x100 ep_9:sIT600TH:SetHeatingSetpoint_x100
        ep_9:sIT600TH:HoldType ep_9:sIT600TH:SetHoldType
        
        For Optima thermostat:
        ep_9:sTherS:CoolingSetpoint_x100 ep_9:sTherS:SetCoolingSetpoint_x100
        ep_9:sTherS:HeatingSetpoint_x100 ep_9:sTherS:SetHeatingSetpoint_x100
        ep_9:sTherS:SystemMode    ep_9:sTherS:SetSystemMode
        ep_9:sTherS:Hold ep_9:sTherS:SetHold
        ep_9:sFanS:FanMode    ep_9:sFanS:SetFanMode
        
        Best regards,
        Kairy
        
        *********************************
        2016-04-21 chnage requestWe decide not to add online status in .clp file, rule engine inside gateway will check this status.
        
        Please put the Single Control Rules in the beginning of .clp file.
        
        For iT600 thermostat, any of below properties (in left) changed, the corresponding SetXXX properties (in right) should be set to the linked devices:
        ep_9:sIT600TH:MaxHeatingSetpoint_x100 -> ep_9:sIT600TH:SetMaxHeatingSetpoint_x100                    (add, no MinHeatingSetpoint_x100)
        ep_9:sIT600TH:MinCoolingSetpoint_x100 -> ep_9:sIT600TH:SetMinCoolingSetpoint_x100                        (add, no MaxCoolingSetpoint_x100)
        ep_9:sIT600TH:HeatingSetpoint_x100 -> ep_9:sIT600TH:SetHeatingSetpoint_x100
        ep_9:sIT600TH:CoolingSetpoint_x100 -> ep_9:sIT600TH:SetCoolingSetpoint_x100
        ep_9:sIT600TH:HeatingSetpoint_x100 -> ep_9:sIT600TH:SetAutoHeatingSetpoint_x100        (add)
        ep_9:sIT600TH:CoolingSetpoint_x100 -> ep_9:sIT600TH:SetAutoCoolingSetpoint_x100         (add)
        ep_9:sIT600TH:HoldType -> ep_9:sIT600TH:SetHoldType
        
        
        */
        "linkedPropertyArrayByOemModel": {
            "it600ThermHW": [
                {
                    "checkName": "ep_9:sIT600TH:MaxHeatSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetMaxHeatSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:MinCoolSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetMinCoolSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:AutoHeatingSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetAutoHeatingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:AutoCoolingSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetAutoCoolingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:CoolingSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetCoolingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:HeatingSetpoint_x100_a",
                    "assertName": "ep_9:sIT600TH:SetHeatingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sIT600TH:HoldType_a",
                    "assertName": "ep_9:sIT600TH:SetHoldType"
                }
            ],
            "ST880ZB": [
                {
                    "checkName": "ep_9:sTherS:CoolingSetpoint_x100_a",
                    "assertName": "ep_9:sTherS:SetCoolingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sTherS:HeatingSetpoint_x100_a",
                    "assertName": "ep_9:sTherS:SetHeatingSetpoint_x100"
                },
                {
                    "checkName": "ep_9:sTherS:SystemMode_a",
                    "assertName": "ep_9:sTherS:SetSystemMode"
                },
                {
                    "checkName": "ep_9:sTherS:Hold",
                    "assertName": "ep_9:sTherS:SetHold"
                },
                {
                    "checkName": "ep_9:sFanS:FanMode",
                    "assertName": "ep_9:sFanS:SetFanMode"
                }
            ]
        },
        "ruleTemplateArray": [
            "#nextErrorHere#",
            "(defrule RuleKey-#ruleKeyStringHere# \"#ruleNameStringHere#\"\n",
            "#nextBindValueHere#",
            "#tab#(test (and\n",
            "#tab##tab##activeTestHere#",
            "#conditionHere#\n",
            "#tab#))\n",
            "#tab#=>\n",
            "#nextActionHere#",
            "#tab#(assert (Queue (EUID \"E0000000000000000\") (Name \"ep_0:sRule:SetRuleFired\") (Value \"#partRuleKeyHere#\")))\n",
            ")\n"
        ],
        "bindValueTemplateArray": [
            "#nextErrorHere#",
            "#tab#(Property",
            " (EUID E#euidHere#)",
            " (Name #nameHere#)",
            " (OldValue ?#propertyNameHere#Old)",
            " (Value ?#propertyNameHere#)",
            " (Detected ?#propertyNameHere#Detected)",
            ")\n"
        ],
        "listFileTemplateArray": [
            "#nextErrorHere#",
            "[\n",
            "#nextPropertyNameHere#",
            "#tab#\"\"\n",
            "]\n"
        ],
        "propertyNameTemplateArray": [
            "#nextErrorHere#",
            "#tab#\"E#propertyNameHere#\",\n"
        ],
        "noOldValueByPropertyName": {
            "ep_0:sRule:Timestamp_i": false,
            "ep_0:sRule:Time_i": false,
            "ep_0:sRule:Date_i": false,
            "ep_0:sRule:Datetime_i": false,
            "ep_0:sRule:Weekday_i": false,
            "ep_0:sRule:Day_i": false,
            "ep_0:sRule:Month_i": false,
            "ep_0:sRule:Frequency_i": false,
            "ep_0:sRule:TriggerRule": true
        },
        "excludeFromTxtFileByPropertyName": {
            "ep_0:sRule:Timestamp_i": true,
            "ep_0:sRule:Time_i": true,
            "ep_0:sRule:Date_i": true,
            "ep_0:sRule:Datetime_i": true,
            "ep_0:sRule:Weekday_i": true,
            "ep_0:sRule:Day_i": true,
            "ep_0:sRule:Month_i": true,
            "ep_0:sRule:Frequency_i": true
        }
    }
    //-------------sean add----7-8----------------
    function checkValidJsonFormat(cJSON) {
        var ret;
        if (!cJSON)
            return true;
        if (!(cJSON.parameters instanceof Array))
            return true;
        if (cJSON.op == "EQ" && cJSON.parameters[0].op == "GetValue")
            return true;
        for (var i = 0; i < cJSON.parameters.length; i++) {
            if (cJSON.op == "AND" && cJSON.parameters[i].op == "OR")
                return false;
            ret = checkValidJsonFormat(cJSON.parameters[i]);
            if (ret == false) {
                return false;
            }
        }
        return true;


    }
    function removeNullJSONArr(cJSON) {
        if (Array.isArray(cJSON.parameters)) {
            cJSON.parameters = cJSON.parameters.filter(removeNullJSONArr);
            return cJSON.parameters.length;
        }
        return true;
    }
    /*
    function removeNullJSONArr(cJSON){      
            var tmp = {};
            if(!cJSON)
                    return cJSON;
            if(!(cJSON.parameters instanceof Array))
                    return cJSON;
            if(cJSON.parameters.length == 0){
                    return tmp;
            }
            for(var i=cJSON.parameters.length-1;i>=0;i--){
                    if(!(cJSON.parameters[i].parameters instanceof Array))
                            continue;
                    if(cJSON.parameters[i].parameters.length==0){
                            cJSON.parameters.splice(i,1);
                    }else{
                            cJSON.parameters[i] = removeNullJSONArr(cJSON.parameters[i]);
                    }
            }
            if(cJSON.parameters.length==0){
                    cJSON = removeNullJSONArr(cJSON);
            }
            return cJSON;
    
    }
    */
    function removeNumOneElement(cJSON) {
        var tmpJSON = cJSON;
        if (!cJSON)
            return cJSOn;
        if (!(cJSON.parameters instanceof Array))
            return cJSON;
        if (cJSON.parameters.length == 0)
            return cJSON;
        if (cJSON.op == "EQ" || cJSON.op == "NOT" || cJSON.op == "LNOT" || cJSON.op == "BNOT") {//&& cJSON.parameters[0].op=="GetValue"){
            return cJSON;
        }
        if (cJSON.parameters.length == 1) {

            cJSON = cJSON.parameters[0];

        }

        /*      
        else{
                for(var i=0;i<cJSON.parameters.length;i++){
                        var tmpJ1 = removeNumOneElement(cJSON);
                        cJSON.parameters[i] = tmpJ1;
                }
        }
        */
        if (cJSON.parameters.length == 1) {
            cJSON = removeNumOneElement(cJSON);
        } else {
            for (var i = 0; i < cJSON.parameters.length; i++) {
                if (cJSON.parameters)
                    var tmpJ1 = removeNumOneElement(cJSON.parameters[i]);
                cJSON.parameters[i] = tmpJ1;
            }
        }

        return cJSON;
    }

    function reduceNotEle(cJSON) {


        if (Array.isArray(cJSON.parameters)) {
            cJSON.parameters = cJSON.parameters.filter(reduceNotEle);
            if (cJSON.op != "REPEAT") {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    function reduceTimeEle(cJSON) {
        var tmpJSON = JSON.parse(JSON.stringify(cJSON));
        if (!cJSON)
            return cJSON;
        if (cJSON.parameters.length == 0) {
            return cJSON;
        }
        if (cJSON.parameters[0].op == "GetValue") {
            var tmpString = cJSON.parameters[0].parameters[1].string;
            if (config.noOldValueByPropertyName[tmpString]) {
                cJSON = {};
                return cJSON;
            }

        }

        for (var i = cJSON.parameters.length - 1; i >= 0; i--) {
            if (!cJSON.parameters[i].parameters) {
                continue;
            }
            if (cJSON.parameters[i].parameters.length > 0 && cJSON.parameters[i].parameters[0].op == "GetValue") {
                var nameString = cJSON.parameters[i].parameters[0].parameters[1].string;
                if (config.noOldValueByPropertyName[nameString]) {
                    cJSON.parameters.splice(i, 1);

                }
            } else {
                reduceTimeEle(cJSON.parameters[i]);
            }
        }
        return cJSON;
    }
    function reduceJsonLayer(cJSON) {
        //var tmpJSON = JSON.parse(JSON.stringify(cJSONArr));
        var tmpJSON = cJSON;
        var op = cJSON.op;
        var tmparr = [];
        if (!tmpJSON) {
            return cJSON;
        }
        if (!tmpJSON.parameters)
            return cJSON;
        if (tmpJSON.parameters.length == 0) {
            return cJSON;
        }
        for (var i = 0; i < cJSON.parameters.length; i++) {
            var tJSON3 = cJSON.parameters[i];
            if (cJSON.parameters[i].op == "EQ"
                && cJSON.parameters[i].parameters[0].op == "GetValue") {
                continue;
            }
            if (op == cJSON.parameters[i].op) {
                for (var j = 0; j < cJSON.parameters[i].parameters.length; j++) {
                    var tJSON1 = cJSON.parameters[i].parameters[j];
                    if (tJSON1)
                        cJSON.parameters.push(tJSON1);
                }
                reduceJsonLayer(cJSON.parameters[i]);
                tmparr.push(i);


            } else {
                reduceJsonLayer(cJSON.parameters[i]);
            }
        }
        for (var n = tmparr.length - 1; n >= 0; n--) {

            cJSON.parameters.splice(tmparr[n], 1);
        }
        //      console.log(JSON.stringify(tmpJSON));


        return cJSON;
    }
    function notJsonPartAdd(cJSON, oJSON) {
        var newJSON;
        newJSON = {
            "op": "AND",
            parameters: [
                cJSON,
                {
                    "op": "NOT",
                    parameters: [
                        opReplace(oJSON, 'GetValue', 'GetOldValue')
                    ]
                }
            ]
        }
        return newJSON;
    }

    function addIndex(cJSON, index_i) {
        if (cJSON.op) {
            cJSON.index = index_i;
        }
        if (cJSON.parameters) {
            for (var i = 0; i < cJSON.parameters.length; i++) {
                addIndex(cJSON.parameters[i], index_i);
            }
        }
    }
    function notJsonPartHandle(cJSON) {
        var tmpJSON = JSON.parse(JSON.stringify(cJSON));
        var tmp = removeNumOneElement(tmpJSON);
        var tmp_index;
        tmp = reduceJsonLayer(tmp);
        //console.log(JSON.stringify(tmp));

        var tmp_index;

        if (tmp.op == "OR") {
            for (var i = 0; i < tmp.parameters.length; i++) {
                //if(tmp.parameters[i].op=="AND"){
                tmp.parameters[i].index = g_index;
                addIndex(tmp.parameters[i], g_index);

                g_index++;
                //}
            }
        }
        //deal with not part
        var notJson = JSON.parse(JSON.stringify(tmp));
        reduceNotEle(notJson);

        //console.log(JSON.stringify(notJson)); 
        notJson = reduceTimeEle(notJson);
        //console.log(JSON.stringify(notJson));
        //console.log("=========================");
        removeNullJSONArr(notJson);
        //notJson = removeNumOneElement(notJson);
        notJson = reduceJsonLayer(notJson);
        //console.log(JSON.stringify(notJson));
        //console.log("--------------------------");

        //check notJSON valid
        var check_flag = checkValidJsonFormat(notJson);
        if (check_flag == false) {
            return null;
        }
        if (!notJson) {
            return tmp;
        }
        if (!notJson.parameters) {
            return tmp;
        }
        if (notJson.parameters.length == 0) {
            return tmp;
        }
        //console.log(JSON.stringify(notJson));

        //add "not" part to JSON
        if (notJson.op == "AND") {//notJson.op=="AND"
            tmpJSON = notJsonPartAdd(tmp, notJson);
        } else if (notJson.op == "OR") {
            for (var j = 0; j < notJson.parameters.length; j++) {
                tmp_index = notJson.parameters[j].index;
                //      if(notJson.parameters[j].op=="AND"){
                //tmp_index = notJson.parameters[j].index;
                for (var n = 0; n < tmp.parameters.length; n++) {
                    if (tmp.parameters[n].index == tmp_index) {
                        tmp.parameters[n] = notJsonPartAdd(tmp.parameters[n], notJson.parameters[j])
                    }
                }
                //      }else if(notJson.parameters[j].op=="OR"){

                //      }
            }
        } else {
            if (notJson.index != undefined) {
                for (var m = 0; m < tmp.parameters.length; m++) {
                    if (notJson.index == tmp.parameters[m].index) {
                        tmp.parameters[m] = notJsonPartAdd(tmp.parameters[m], notJson);
                    }
                }
            } else {
                tmpJSON = notJsonPartAdd(tmp, notJson);
            }
        }
        return tmpJSON;
    }


    //-------------end sean add---7-8-------------


    // re-load this from firebase if firebase version is > than configVersion

    ///////////// Start Here //////////////////
    function xformRuleFileJSON(inRuleFileJSON) {
        var ruleFileJSON
        // input ruleFileJSON as JSON object
        // returns 2 Strings
        //         ruleFile String is the contents of a CLIPS rule file - property_rule_from_server_{uuid}.clp
        //         listFile String is the contents of a txt file
        //                    listing Property Values needed as facts by the CLIPS rule file - property_list_from_server_{uuid}.txt
        var returnFiles = {
            log: [],    // array of status, error, and warning messages
            ruleFile: config.ruleFileTemplateArray.join(''),
            listFile: config.listFileTemplateArray.join('')
        }
        var propertyNameArray = [] // remember all unique Property Names seen to return in property_list_from_server.txt
        /* EXAMPLE
            propertyNameArray = [
                "E001E5E09021110DA-ep_9:sTherS:SetHeatingSetpoint_x100",
                "E001E5E09023330DB-ep_9:sTherS:SystemMode",
                "{EUID}-{propertyName}"
            ]
        */
        var i = 0
        var ruleFileKeys = []
        var propertyNameTemplate = config.propertyNameTemplateArray.join('')

        if (inRuleFileJSON instanceof Object) {
            ruleFileJSON = inRuleFileJSON
        } else {
            ruleFileJSON = {}
            returnError('ruleFileJSON is not an Object', returnFiles)
        }
        ruleFileKeys = Object.keys(ruleFileJSON || {})
        for (i = 0; i < ruleFileKeys.length; i += 1) {
            var key = ruleFileKeys[i]

            switch (key) {
                case 'rules':
                    xformRulesArray(ruleFileJSON.rules, returnFiles, propertyNameArray)
                    break
                case 'linkedDevices_list':
                    xformLinkedDevicesArray(ruleFileJSON.linkedDevices_list, returnFiles, propertyNameArray)
                    break
                case 'fromRuleUrlByDSN':
                    // ignore fromRuleUrlByDSN.
                    // It is a placeholder to handle the case where there are 0 rules.
                    break
                default:
                    returnWarn('Unrecognized top level key "' + key + '" in ruleFileJSON.', returnFiles)
            }
        } // end iterate over all keys in ruleFileJSON
        returnLog('found ' + i + ' ruleFileKeys', returnFiles)

        // after processing 'rules' and 'linkedDevices_list'
        // propertyNameArray contains all unique Property Names used
        // iterate over propertyNameArray and add each item to file template
        for (i = 0; i < propertyNameArray.length; i += 1) {
            // only include if the name is not in the excludeFromTxtFileByPropertyName object.
            if (!(config.excludeFromTxtFileByPropertyName[propertyNameArray[i].slice('0000000000000000-'.length)])) {
                // the .slice(17) is to remove the first '0000000000000000-'
                returnFiles.listFile =
                    returnFiles.listFile.replace(
                        '#nextPropertyNameHere#',
                        propertyNameTemplate.replace('#propertyNameHere#', propertyNameArray[i])
                        + '#nextPropertyNameHere#'
                    )
            }
        }
        returnLog('found ' + i + ' propertyNames', returnFiles)

        cleanupFiles(returnFiles)

        return returnFiles
    } // end function xformRuleFileJSON()

    function cleanupFiles(files, indentLevel) {
        // replace #indentLevel# with multiple #tab#s
        // if indentLevel is not defined this resolved to repeat(0) and clears #indentLevel#
        files.ruleFile =
            files.ruleFile.replace(/#indentLevel#/g, '#tab#'.repeat(indentLevel))
        files.listFile =
            files.listFile.replace(/#indentLevel#/g, '#tab#'.repeat(indentLevel))
        // replace #tab# tab template
        files.ruleFile = files.ruleFile.replace(/#tab#/g, config.tabTemplate)
        files.listFile = files.listFile.replace(/#tab#/g, config.tabTemplate)
        // remove error and other place holders
        files.ruleFile = files.ruleFile.replace(/#\w*#/g, '')
        files.listFile = files.listFile.replace(/#\w*#/g, '')
    }

    function returnError(msg, files) {
        console.error(msg)
        if (!(files.log && files.log.length)) {
            files.log = []
        }
        files.log.push('#ERR#' + msg)
    }

    function returnWarn(msg, files) {
        console.warn(msg)
        if (!files.log && files.log.length) {
            files.log = []
        }
        files.log.push('#warn#' + msg)
    }

    function returnLog(msg, files) {
        console.log(msg)
        if (!files.log && files.log.length) {
            files.log = []
        }
        files.log.push(msg)
    }

    function addUniquePropertyName(propertyName, propertyNameArray) {

        //if (!propertyNameArray.includes(propertyName)) { //t.title.indexOf(string) >= 0 //MODIFIED BY SEAN
        if (!(propertyNameArray.indexOf(propertyName) >= 0)) {
            // only add this propertyName if it isn't alredy in the propertyNameArray
            propertyNameArray.push(propertyName)
        }
    }

    function xformLinkedDevicesArray(linkedDevicesArray, returnFiles, propertyNameArray) {
        var length = linkedDevicesArray && linkedDevicesArray.length

        if (length) {
            returnLog('xforming ' + length + ' linkedDevice Groups', returnFiles)
            for (var i = 0; i < length; i += 1) {
                xformLinkedDeviceObject(linkedDevicesArray[i], returnFiles, propertyNameArray)
                // this adds rules to #nextSingleControlRuleHere# in returnFiles.ruleFile
                // and updates propertyNameArray
            }
        }
    } // end function xformLinkedDevicesArray()

    function xformLinkedDeviceObject(linkedDeviceObject, returnFiles, propertyNameArray) {
        // this adds rules to #nextSingleControlRuleHere# in returnFiles.ruleFile
        // and updates propertyNameArray
        /* sample format
        {
            "linkedDevices_list" : [
                {
                    "linkedDevices" : {
                        "name": "newname",
                        "devices": [
                            {
                                "EUID": "<device mac or EUID property>",
                                "oem_model": "iT600 || Optima"
                            },
                            {
                                "EUID": "<device mac or EUID property>",
                                "oem_model": "iT600 || Optima"
                            }
                        ]
                    }
                }
            ]
        }
        */
        var returnSubStrings
        var deviceIndex
        var numDevices
        var linkedPropertyIndex
        var numLinkedProperties
        var device
        var linkedDeviceCheckString
        var linkedDeviceAssertString
        var nextBindValueString
        var thisRulePropertyNameMap
        var nextBindValueString
        var euidString
        var checkNameString
        var checkNameStringSpecialCase
        var assertNameString
        var assertRuleKey
        var propertyName
        var propertyNameSpecialCase
        var oem_model
        var linkedPropertyArray
        var linkedDevicePartString
        var linkTime    //sean add 2017/06/19
        var ruleTime

        if (linkedDeviceObject && linkedDeviceObject.clp && linkedDeviceObject.properties) {
            returnFiles.ruleFile = returnFiles.ruleFile.replace('#nextSingleControlRuleHere#', new Buffer(linkedDeviceObject.clp, 'base64').toString('ascii') + '#nextSingleControlRuleHere#')
            var length = linkedDeviceObject.properties.length;
            for (var i = 0; i < length; i++) {
                addUniquePropertyName(linkedDeviceObject.properties[i], propertyNameArray)
            }
        } else if (linkedDeviceObject && linkedDeviceObject.linkedDevices) {
            //sean add 2017-06-16
            linkedDeviceObject.linkedDevices.devices.push({ "EUID": "0000000000000000", "oem_model": "gateway" });
            //end add
            numDevices = linkedDeviceObject.linkedDevices.devices && linkedDeviceObject.linkedDevices.devices.length
            linkTime = numDevices + 1  //sean add 2017/06/19
            ruleTime = numDevices

            if (numDevices < 2) {
                // ignore lists of devices with numDevices == 1
                // this can happend when there is a group of 2 and 1 device is removed.
                returnWarn('linkedDevices has only 1 or 0 device', returnFiles)
                return
            }
            // all devices must be same oem_model so check index 0 only
            device = linkedDeviceObject.linkedDevices.devices[0]
            if (device.oem_model == 'it600ThermHW') {
                oem_model = 'it600ThermHW' // iT600
            } else if (device.oem_model == 'ST880ZB') {
                oem_model = 'ST880ZB' // Optima
            } else if (device.oem_model && device.oem_model.match(/600/)) {  //sean comment: guess?
                returnWarn('Unrecognized oem_model ' + device.oem_model + ' guessing it600ThermHW', returnFiles)
                oem_model = 'it600ThermHW'
            } else {
                returnWarn('Unrecognized oem_model ' + device.oem_model + ' guessing ST880ZB', returnFiles)
                oem_model = 'ST880ZB'
            }

            linkedPropertyArray = config.linkedPropertyArrayByOemModel[oem_model]
            numLinkedProperties = linkedPropertyArray && linkedPropertyArray.length
            // now add a rule for every linked property
            for (linkedPropertyIndex = 0; linkedPropertyIndex < numLinkedProperties; linkedPropertyIndex++) {
                returnSubStrings = {
                    log: [],
                    ruleFile: config.linkedDeviceRuleTemplateArray.join(''),
                    listFile: '#nextErrorHere#'
                }
                checkNameString = linkedPropertyArray[linkedPropertyIndex].checkName

                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace('#ruleKeyStringHere#', linkedDeviceObject.key + '_i' + linkedPropertyIndex)
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace('#ruleNameStringHere#', linkedDeviceObject.linkedDevices.name + checkNameString)

                returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#ruleTimeHere#', ruleTime + '')
                returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#linkTimeHere#', linkTime + '')


                //returnSubStrings.ruleFile =
                //returnSubStrings.ruleFile.replace('#partRuleKeyHere#', (linkedDeviceObject.key+'_i'+linkedPropertyIndex).slice(-7))
                thisRulePropertyNameMap = {
                    __nextName__: 1
                }
                linkedDeviceCheckString = config.linkedDeviceCheckTemplateArray.join('')


                for (deviceIndex = 0; deviceIndex < numDevices; deviceIndex++) {
                    device = linkedDeviceObject.linkedDevices.devices[deviceIndex]
                    euidString = device.EUID
                    assertNameString = 'Linked-E' + euidString + '-' + linkedPropertyArray[linkedPropertyIndex].assertName
                    assertRuleKey = assertNameString + '-' + 'ep_0:sRule:SetRuleFired'
                    if (euidString == "0000000000000000") { //sean add 2017/06/19
                        propertyName = euidString + '-' + 'LinkedRuleKey' + '-' + linkedDeviceObject.key + '_i' + linkedPropertyIndex
                    } else {
                        propertyName = euidString + '-' + checkNameString
                    }
                    /////////////// Special case
                    // Hi Duppy,
                    //
                    // For ep_9:sTherS:CoolingSetpoint_x100    and ep_9:sTherS:HeatingSetpoint_x100 property in Optima thermostat Single rule, please add one more logic:
                    //
                    // When ep_9:sTherS:CoolingSetpoint_x100 changed AND ep_9:sTherS:Hold_x100<>0, then set to other devices
                    // When ep_9:sTherS:HeatingSetpoint_x100 changed AND ep_9:sTherS:Hold_x100<>0, then set to other devices
                    //
                    // Best regards,
                    // Kairy
                    checkNameStringSpecialCase = config.linkedDeviceCheckUseSpecialCaseByPropertyName[checkNameString]
                    if (1 == 0) {//if(checkNameStringSpecialCase) ---sean-add:sThers not special case
                        propertyNameSpecialCase = euidString + '-' + checkNameStringSpecialCase
                        addUniquePropertyName(propertyNameSpecialCase, propertyNameArray)
                        if (!thisRulePropertyNameMap[propertyNameSpecialCase]) {
                            nextBindValueString = config.bindValueTemplateArray.join('')
                            thisRulePropertyNameMap[propertyNameSpecialCase] = 'V' + thisRulePropertyNameMap.__nextName__
                            thisRulePropertyNameMap.__nextName__ += 1
                            propertyNameSpecialCase = thisRulePropertyNameMap[propertyNameSpecialCase]
                            nextBindValueString = nextBindValueString.replace(/#euidHere#/g, euidString)
                            nextBindValueString = nextBindValueString.replace(/#nameHere#/g, checkNameStringSpecialCase)
                            nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyNameSpecialCase)
                            returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')
                        } else {
                            propertyNameSpecialCase = thisRulePropertyNameMap[propertyNameSpecialCase]
                        }
                        linkedDeviceCheckString = config.linkedDeviceCheckSpecialCaseTemplateArray.join('')
                    } else {
                        // linkedDeviceCheckString = config.linkedDeviceCheckTemplateArray.join('')
                        //linkedDevicePartString = config.linkedDeviceCheckPart.join('')
                    }
                    /////////////// END Special case


                    //sean add it600 special case
                    if (checkNameString == 'ep_9:sIT600TH:HoldType') {
                        linkedDevicePartString = config.linkedDeviceSpecialCheckPart.join('')
                    } else {
                        linkedDevicePartString = config.linkedDeviceCheckPart.join('')
                    }
                    //sean end it600 special case
                    addUniquePropertyName(propertyName, propertyNameArray)
                    if (!thisRulePropertyNameMap[propertyName]) {
                        nextBindValueString = config.bindValueTemplateArray.join('')
                        thisRulePropertyNameMap[propertyName] = 'V' + thisRulePropertyNameMap.__nextName__
                        thisRulePropertyNameMap.__nextName__ += 1
                        propertyName = thisRulePropertyNameMap[propertyName]
                        if (euidString != "0000000000000000") { //sean add 2017-06-16
                            nextBindValueString = nextBindValueString.replace(/#euidHere#/g, euidString)
                            nextBindValueString = nextBindValueString.replace(/#nameHere#/g, checkNameString)
                            nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyName)
                            returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')
                        } else {
                            nextBindValueString = nextBindValueString.replace(/#euidHere#/g, euidString)
                            nextBindValueString = nextBindValueString.replace(/#nameHere#/g, 'LinkedRuleKey' + '-' + linkedDeviceObject.key + '_i' + linkedPropertyIndex)
                            nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyName)
                            returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')

                            nextBindValueString = config.bindValueTemplateArray.join('')
                            thisRulePropertyNameMap[propertyName] = 'V' + thisRulePropertyNameMap.__nextName__
                            thisRulePropertyNameMap.__nextName__ += 1
                            propertyName = thisRulePropertyNameMap[propertyName]
                            nextBindValueString = nextBindValueString.replace(/#euidHere#/g, euidString)
                            nextBindValueString = nextBindValueString.replace(/#nameHere#/g, "ep_0:sRule:Timestamp_i")
                            nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyName)
                            returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')

                        }
                    } else {
                        propertyName = thisRulePropertyNameMap[propertyName]
                    }
                    if (euidString != "0000000000000000") {
                        linkedDeviceCheckString = linkedDeviceCheckString.replace(/#nextLinkedDeviceCheckPartHere#/g, linkedDevicePartString + '#nextLinkedDeviceCheckPartHere#')
                        linkedDeviceCheckString = linkedDeviceCheckString.replace(/#nextPropertyNameHere#/g, propertyName + ' ?#nextPropertyNameHere#')
                        linkedDeviceCheckString = linkedDeviceCheckString.replace(/#propertyNameHere#/g, propertyName)
                        linkedDeviceCheckString = linkedDeviceCheckString.replace(/#propertyNameSpecialCaseHere#/g, propertyNameSpecialCase)
                        // returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace(/#nextLinkedDeviceCheckHere#/g, linkedDeviceCheckString + '#nextLinkedDeviceCheckHere#')
                        if (checkNameString == 'ep_9:sIT600TH:HoldType') {
                            linkedDeviceAssertString = config.linkedDeviceAssertSpecialArray.join('')
                        } else {
                            linkedDeviceAssertString = config.linkedDeviceAssertTemplateArray.join('')

                        }
                    }
                    // linkedDeviceAssertString = config.linkedDeviceAssertTemplateArray.join('')
                    if (euidString != "0000000000000000") {
                        linkedDeviceAssertString = linkedDeviceAssertString.replace('#partRuleKeyHere#', (linkedDeviceObject.key + '_i' + linkedPropertyIndex).slice(-7))

                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#euidHere#/g, euidString)
                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#assertNameHere#/g, assertNameString)
                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#assertRuleKeyHere#/g, assertRuleKey)
                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#ruleNameHere#/g, 'LinkedRuleKey' + '-' + linkedDeviceObject.key + '_i' + linkedPropertyIndex)//sean add 2017/06/19
                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#propertyNameHere#/g, propertyName)
                        linkedDeviceAssertString = linkedDeviceAssertString.replace(/#linkTimeHere#/g, linkTime)
                        returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace(/#nextLinkedDeviceAssertHere#/g, linkedDeviceAssertString + '#nextLinkedDeviceAssertHere#')
                    }
                }
                linkedDeviceCheckString = linkedDeviceCheckString.replace(' ?#nextPropertyNameHere#', '')
                returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace(/#nextLinkedDeviceCheckHere#/g, linkedDeviceCheckString + '#nextLinkedDeviceCheckHere#')

                cleanupFiles(returnSubStrings)
                // update returnFiles with what we found
                returnFiles.ruleFile = returnFiles.ruleFile.replace('#nextSingleControlRuleHere#', returnSubStrings.ruleFile + '#nextSingleControlRuleHere#')
                // append log of returnSubStrings to returnFiles
                returnFiles.log = returnFiles.log.concat(returnSubStrings.log)
            }
        } else {
            // linkedDeviceObject is not an object or there is not linkedDevices key
            returnError('no linkedDevices or maybe no linkedDeviceObject', returnFiles)
        }
    } // end function xformLinkedDeviceObject()

    function xformRulesArray(rulesArray, returnFiles, propertyNameArray) {
        // TODO: this is very similar to xformLinkedDevicesArray()
        var length = rulesArray.length

        if (!length) {
            returnError('rulesArray is not an Array or empty!', returnFiles)
            return
        } else {
            returnLog('xforming ' + length + ' rules', returnFiles)
            for (var i = 0; i < length; i += 1) {
                // returnLog('rule ' + i, returnFiles)
                xformRuleJSON(rulesArray[i], returnFiles, propertyNameArray)
                // this adds rules to #nextRuleHere# in returnFiles.ruleFile
                // and updates propertyNameArray
            }
        }
    } // end function xformRulesArray()

    function xformRuleJSON(ruleJSON, returnFiles, propertyNameArray) {
        // this adds rules to #nextRuleHere# in returnFiles.ruleFile
        // and updates propertyNameArray
        var returnSubStrings = {
            log: [],
            ruleFile: config.ruleTemplateArray.join(''),
            listFile: '#nextErrorHere#'
        }

        if (!(ruleJSON instanceof Object)) {
            returnError('ruleJSON is not an Object.', returnSubStrings)
        } else if (ruleJSON.clp && ruleJSON.properties) {
            returnSubStrings.ruleFile = new Buffer(ruleJSON.clp, 'base64').toString('ascii')
            var length = ruleJSON.properties.length;
            for (var i = 0; i < length; i++) {
                addUniquePropertyName(ruleJSON.properties[i], propertyNameArray)
            }
        } else {
            var ruleJSONKeys = Object.keys(ruleJSON)
            var length = ruleJSONKeys.length
            var active = true // rule is active default if 'active' key does not exist
            var hasKey = false
            var hasName = false
            var hasCondition = false
            var hasAction = false
            var conditionString = '#tab##tab#; ERROR: no condition key, add default false test\n#tab##tab#(eq 1 0)\n'
            var thisRulePropertyNameMap = {
                __nextName__: 1
            }
            var newConditionJSON

            for (var i = 0; i < length; i += 1) {
                var key = ruleJSONKeys[i]
                var cancelTimerActivedList = []

                switch (key) {
                    case 'key':
                        hasKey = true
                        returnSubStrings.ruleFile =
                            returnSubStrings.ruleFile
                                .replace('#ruleKeyStringHere#', ruleJSON.key)

                        returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace('#partRuleKeyHere#', ruleJSON.key.slice(-7))
                        break
                    case 'name':
                        hasName = true
                        returnSubStrings.ruleFile =
                            returnSubStrings.ruleFile
                                .replace('#ruleNameStringHere#', escape(ruleJSON.name))
                        break
                    case 'uxhint':
                        // console.log('ignoring "uxhint" key')
                        break
                    case 'condition':
                        hasCondition = true
                        //newConditionJSON = notJsonPartHandle(newConditionJSON)
                        newConditionJSON = fixEQTimestamp_i(ruleJSON.condition, cancelTimerActivedList)
                        newConditionJSON = notJsonPartHandle(newConditionJSON)

                        if (cancelTimerActivedList.length == 0) {
                            // there were no timer triggers so make this a Just Changed rule
                            //newConditionJSON = notJsonPartHandle(newConditionJSON)
                            //var tmpJSON = newConditionJSON
                            //newConditionJSON = findSpecialJSON(tmpJSON);
                        } else {
                            // there were time triggers, so cancel them all in the action portion
                            if (!(ruleJSON.action && ruleJSON.action.length)) {
                                ruleJSON.action = []
                            }
                            for (var j = 0; j < cancelTimerActivedList.length; j++) {
                                ruleJSON.action.push(
                                    {
                                        "op": "CancelTimer",
                                        "parameters": cancelTimerActivedList[j]
                                    }
                                )
                            }
                        }
                        conditionString = xformRuleCondition(newConditionJSON, returnSubStrings, propertyNameArray, thisRulePropertyNameMap, 2)
                        // because condition needs to be parsed recursively, this returns conditionString
                        // xformRuleCondition() updates #nextBindValueHere# in returnSubStrings.ruleFile
                        // and updates propertyNameArray and thisRulePropertyNameMap
                        break
                    case 'action':
                        // do not process action until we are sure condition is processed
                        //         hasAction = true
                        //         xformRuleActionArray(ruleJSON.action, returnSubStrings, propertyNameArray, thisRulePropertyNameMap)
                        break
                    case 'active':
                        active = ruleJSON.active
                        break
                    default:
                        returnError('Unrecognized top level key "' + key + '" in ruleJSON!', returnSubStrings)
                }
            } // end for(all ruleJSONKeys[i])

            // must process action key after processing condition.
            if (ruleJSON.action && ruleJSON.action.length) {
                hasAction = true
                xformRuleActionArray(ruleJSON.action, returnSubStrings, propertyNameArray, thisRulePropertyNameMap)
            }

            if (!active) { // if active key is false, do not add this rule
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace(/#activeTestHere#/, '(eq 1 0)') // activate rule
            } else {
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace(/#activeTestHere#/, '(eq 1 1)') // de-activate rule
            }
            returnSubStrings.ruleFile =
                returnSubStrings.ruleFile.replace(/#conditionHere#/, conditionString)

            if (!hasAction) {
                returnError('missing "action" key', returnSubStrings)
            }
            if (!hasCondition) {
                returnError('missing "condition" key', returnSubStrings)
            }
            if (!hasKey) {
                returnError('missing "key" key', returnSubStrings)
            }
            if (!hasName) {
                returnWarn('missing "name" key', returnSubStrings)
            }
        }
        // remove error and other place holders
        cleanupFiles(returnSubStrings) // TODO: add , 2) for indentLevel and change activeTestHere above to FALSE and TRUE templates instead of hard coded (eq 1 0) and (eq 1 1)
        // update returnFiles with what we found
        returnFiles.ruleFile =
            returnFiles.ruleFile.replace('#nextRuleHere#', returnSubStrings.ruleFile + '#nextRuleHere#')
        // append log of returnSubStrings to returnFiles
        returnFiles.log = returnFiles.log.concat(returnSubStrings.log)
    } // end of xformRuleJSON

    function hasAnyKeyValueInParameters(key, value, parameters) {
        // return false if key does not exist equal to this value in any element of the parameters array
        // return object (array elelment) of the one where it exists
        var newJSON
        var length = parameters && parameters.length

        for (var i = 0; i < length; i++) {
            if (parameters[i][key] == value) {
                return parameters[i]
            }
        }

        return false
    } // end of hasAnyKeyValueInParameters()

    function hasTriggerRule(cJSON) {
        var nextJSON

        if (!cJSON || cJSON.op != "OR")
            return false

        nextJSON = hasAnyKeyValueInParameters("op", "EQ", cJSON.parameters)
        if (nextJSON) {
            nextJSON = hasAnyKeyValueInParameters("op", "GetValue", nextJSON.parameters)
            if (nextJSON) {
                nextJSON = hasAnyKeyValueInParameters("string", "ep_0:sRule:TriggerRule", nextJSON.parameters)
                if (nextJSON) {
                    return true
                }
            }
        }
        return false
    }

    //sean add:5-30
    function addNOTJson(cJSON) {
        var tmpJSON = cJSON;
        if (tmpJSON.op == "EQ") {
            if (tmpJSON.parameters[0].op == "GetValue") {
                var newJSON = {
                    "op": "AND",
                    "parameters": [
                        tmpJSON,
                        {
                            "op": "NOT",
                            parameters: [
                                opReplace(tmpJSON, 'GetValue', 'GetOldValue')
                            ]
                        }
                    ]
                }
                return newJSON;
            }
        }
        return tmpJSON;
    }
    //sean add:5-30  fix 'not' bug
    function findSpecialJSON(cJSON) {
        var tmpJSON = cJSON;
        if (cJSON.op == "EQ" && cJSON.parameters[0].op == "GetValue") {
            tmpJSON = addNOTJson(cJSON);
            cJSON = tmpJSON;
            //return tmpJSON;
        }
        if (!cJSON.parameters) {
            return tmpJSON;
        }
        for (var i = 0; i < cJSON.parameters.length; i++) {
            if (cJSON.parameters[i].op == "EQ"
                && cJSON.parameters[i].parameters[0].op == "GetValue") {
                //if(hasTriggerRule(cJSON.parameters[i])){
                if (cJSON.parameters[i].parameters[0].parameters[1].string == "ep_0:sRule:TriggerRule") {
                    tmpJSON.parameters[i] = cJSON.parameters[i];
                } else {
                    tmpJSON.parameters[i] = addNOTJson(cJSON.parameters[i]);

                }

            } else {
                tmpJSON.parameters[i] = findSpecialJSON(cJSON.parameters[i]);
            }
        }
        return tmpJSON;
    }



    function conditionJustChanged(cJSON) {
        // transform condition If A into If (A && NOT (A.OldValue))
        var newJSON, nextJSON

        if (hasTriggerRule(cJSON)) {
            // preserve triggerRule side of the top level OR
            var nonTriggerRuleTerm, triggerRuleTerm
            // FIX case where there is only 1 term and it is the triggerRuleTerm
            if (cJSON.parameters.length == 1) {
                return cJSON
            }
            // find which side is the triggerRuleTerm.  CONSTRAINT: Assume only 2 terms
            // check term 0
            if (cJSON.parameters[0].op == "EQ") {
                nextJSON = hasAnyKeyValueInParameters("op", "GetValue", cJSON.parameters[0].parameters)
                if (nextJSON) {
                    nextJSON = hasAnyKeyValueInParameters("string", "ep_0:sRule:TriggerRule", nextJSON.parameters)
                    if (nextJSON) {
                        triggerRuleTerm = cJSON.parameters[0]
                        nonTriggerRuleTerm = cJSON.parameters[1]
                        //add by sean
                        //Rollbar.scope({fingerprint: "has_TriggerRule"}).warning('ep_0:sRule:TriggerRule found at parameters[0]')
                        console.warn('ep_0:sRule:TriggerRule found at parameters[0]')
                    }
                }
            } else {
                triggerRuleTerm = cJSON.parameters[1]
                nonTriggerRuleTerm = cJSON.parameters[0]
                //add by sean
                //Rollbar.scope({fingerprint: "has_TriggerRule"}).warning('ep_0:sRule:TriggerRule found at parameters[1]')
                console.warn('ep_0:sRule:TriggerRule found at parameters[1]')
            }
            newJSON = {
                "op": "OR",
                "parameters": [
                    triggerRuleTerm,
                    conditionJustChanged(nonTriggerRuleTerm)
                ]
            }
        } else {
            // transform condition If A into If (A && NOT (A.OldValue))
            newJSON = {
                "op": "AND",
                "parameters": [
                    cJSON, // pass by reference but that is OK
                    {
                        "op": "NOT",
                        parameters: [
                            opReplace(cJSON, 'GetValue', 'GetOldValue')
                        ]
                    }
                ]
            }
        }

        return newJSON
    }

    function fixEQTimestamp_i(conditionJSON, cancelTimerActivedList) {
        // transform condition If EQ and one op is Timestamp_i
        // to account for up to 1 minute slop in polling
        // doesn't account for slop anymore.    Just converts from EQ to GTE.
        // rely on action portion to assert NULL on TimerActived_XXX to prevent continued firing
        // TODO: change DF web/phone app to use GTE time compare directly, removing need for this fix up.
        var newConditionJSON
        var copyConditionJSON
        var numParams = conditionJSON.parameters && conditionJSON.parameters.length

        copyConditionJSON = JSON.parse(JSON.stringify(conditionJSON)) // make copy
        newConditionJSON = JSON.parse(JSON.stringify(conditionJSON)) // make copy

        if ( // if we are comparing ep_0:sRule:TimerActived_ to ep_0:sRule:Timestamp_i
            (copyConditionJSON.op == "EQ")
            &&
            ((copyConditionJSON.parameters[0].op == "GetValue")
                &&
                (copyConditionJSON.parameters[0].parameters[1].string == "ep_0:sRule:Timestamp_i"))
            &&
            ((copyConditionJSON.parameters[1].op == "GetValue")
                &&
                (copyConditionJSON.parameters[1].parameters[1].string.slice(0, "ep_0:sRule:TimerActived_".length) == "ep_0:sRule:TimerActived_"))
        ) {
            //         So I should use
            // (and
            // (egt ?V1 ?V2)
            // (lt ?V1 (str-cat "" (+ ?V2 60000)))
            // )
            //
            // now using only (egt ?V1 ?V2) and relying on
            // (assert (Queue (EUID “E0000000000000000") (Name "ep_0:sRule: TimerActived_timerTriggerKey-620a99b5141d0d44c5e5c695a1fa417f") (Value "NULL"))) to prevent continued firing
            cancelTimerActivedList.push(JSON.parse(JSON.stringify(copyConditionJSON.parameters[1].parameters)))
            newConditionJSON.op = "GTE"
            // newConditionJSON = {
            //         "op" : "AND",
            //         "parameters" : [
            //                 {
            //                         "op" : "GTE",
            //                         "parameters" : [
            //                                 JSON.parse(JSON.stringify(copyConditionJSON.parameters[0])),
            //                                 JSON.parse(JSON.stringify(copyConditionJSON.parameters[1]))
            //                         ]
            //                 },
            //                 {
            //                         "op" : "LT",
            //                         "parameters" : [
            //                                 JSON.parse(JSON.stringify(copyConditionJSON.parameters[0])),
            //                                 {
            //                                         "op" : "ADD",
            //                                         "parameters" : [
            //                                                 JSON.parse(JSON.stringify(copyConditionJSON.parameters[1])),
            //                                                 {"number": 60}
            //                                         ]
            //                                 }
            //                         ]
            //                 }
            //         ]
            // }
        } else {
            for (var i = 0; i < numParams; i++) {
                newConditionJSON.parameters[i] = fixEQTimestamp_i(copyConditionJSON.parameters[i], cancelTimerActivedList)
            }
        }

        return newConditionJSON
    }

    function opReplace(conditionJSON, oldOp, newOp) {
        // recursively replace oldOp with newOp
        var newConditionJSON
        var numParams = conditionJSON && conditionJSON.parameters && conditionJSON.parameters.length
        newConditionJSON = JSON.parse(JSON.stringify(conditionJSON)) // make copy

        if (newConditionJSON.op == oldOp) {
            newConditionJSON.op = newOp
        }

        for (var i = 0; i < numParams; i++) {
            newConditionJSON.parameters[i] = opReplace(newConditionJSON.parameters[i], oldOp, newOp)
        }

        return newConditionJSON
    }

    function xformRuleCondition(conditionJSON, returnFiles, propertyNameArray, thisRulePropertyNameMap, indentLevel) {
        var numParams = conditionJSON.parameters && conditionJSON.parameters.length
        var returnSubStrings = {
            log: [],
            ruleFile: '#nextErrorHere#',
            listFile: '#nextErrorHere#'
        }

        if (!(conditionJSON instanceof Object)) {
            returnSubStrings.ruleFile =
                returnSubStrings.ruleFile.replace('#nextErrorHere#', '\n(eq 1 0); assuming false #nextErrorHere#')
            returnError('conditionJSON is not an Object', returnSubStrings)
        }

        if (conditionJSON.op == undefined) {
            // fixup conditionJSON shorthand
            /************************************************************************
            {
                "number" : 1234
            }
            Is shorthand for
            {
                "op" : "Number",
                "parameters" : [
                    1234
                ]
            }
            ************************************************************************/
            if (conditionJSON.number != undefined) {
                conditionJSON.op = "Number"
                conditionJSON.parameters = [conditionJSON.number]
            } else if (conditionJSON.string != undefined) {
                conditionJSON.op = "String"
                conditionJSON.parameters = [conditionJSON.string]
            } else if (conditionJSON.quotedString != undefined) {
                conditionJSON.op = "QuotedString"
                conditionJSON.parameters = [conditionJSON.quotedString]
            } else {
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace('#nextErrorHere#', '\n(eq 1 0); assuming false #nextErrorHere#')
                returnError('conditionJSON is not an op, number or string!', returnSubStrings)
            }
        }

        if (config.conditionTemplateByOp[conditionJSON.op] && config.conditionTemplateByOp[conditionJSON.op].template) {
            returnSubStrings.ruleFile += config.conditionTemplateByOp[conditionJSON.op].template
            if (
                (numParams < config.conditionTemplateByOp[conditionJSON.op].minParameters)
                || (numParams > config.conditionTemplateByOp[conditionJSON.op].maxParameters)
            ) {
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace('#nextErrorHere#', '\n(eq 1 0); assuming false #nextErrorHere#')
                returnError('invalid number of parameters for conditionJSON.op "' + conditionJSON.op + '"', returnSubStrings)
            }
        } else {
            returnSubStrings.ruleFile =
                returnSubStrings.ruleFile.replace('#nextErrorHere#', '\n(eq 1 0); assuming false #nextErrorHere#')
            returnError('No template for conditionJSON.op "' + conditionJSON.op + '"', returnSubStrings)
        }

        switch (conditionJSON.op) {
            case 'AND':
            case 'TRUE':
            case 'FALSE':
            case 'OR':
            case 'NOT':
            case 'EQ':
            case 'NEQ':
            case 'STR-INDEX':
            case 'LT':
            case 'GT':
            case 'LTE':
            case 'GTE':
            case 'BWT':
            case 'REPEAT':
            case 'ADD':
            case 'BIT':
            case 'BAND':
            case 'SUB':
            case 'MUL':
            case 'DIV':
            case 'MAX':
            case 'MIN':
            case 'LAND':
            case 'LOR':
            case 'LNOT':
            case 'BOR':
            case 'BXOR':
            case 'BNOT':
            case 'sub-string':
            case 'SUBDEC':
            case 'SUBHEX':
            case 'SUBSYM':
                for (var i = 0, paramString = ''; i < numParams; i++) {
                    // look for TriggerRule examples
                    // if (conditionJSON.op == 'OR') {
                    //     var length2 = conditionJSON.parameters[i].parameters && conditionJSON.parameters[i].parameters.length
                    //     for (var j=0; j < length2; j++) {
                    //         if (conditionJSON.parameters[i].parameters[j].parameters && (conditionJSON.parameters[i].parameters[j].parameters.length >= 2) && conditionJSON.parameters[i].parameters[j].parameters[1].string == 'ep_0:sRule:TriggerRule') {
                    //             console.warn('ep_0:sRule:TriggerRule found at level ' + indentLevel + ' with ops ' + conditionJSON.op + ', ' + conditionJSON.parameters[i].op)
                    //             // This is using too much Rollbar bandwidth
                    //         //     Rollbar.scope({fingerprint: "search_TriggerRule"}).warning('ep_0:sRule:TriggerRule found at level ' + indentLevel + ' with ops ' + conditionJSON.op + ', ' + conditionJSON.parameters[i].op)
                    //         }
                    //     }
                    // }
                    // END look for TriggerRule examples
                    paramString = xformRuleCondition(conditionJSON.parameters[i], returnFiles, propertyNameArray, thisRulePropertyNameMap, indentLevel + 1)
                    // GetOldValue will return 'NA' if the property has no OldValue
                    // Only thing to do is make the whole term false
                    if (paramString == 'NA') {
                        returnSubStrings.ruleFile = config.conditionTemplateByOp['FALSE'].template
                        break
                    }
                    returnSubStrings.ruleFile =
                        returnSubStrings.ruleFile.replace('#nextParameterHere#', paramString + '#nextParameterHere#')
                }
                break
            case 'GetValue':
            case 'ValueChanged':
            case 'GetOldValue':
            case 'GetValueChangedTime':
                var euidString = xformRuleCondition(conditionJSON.parameters[0], returnFiles, propertyNameArray, thisRulePropertyNameMap, indentLevel + 1)
                var nameString = xformRuleCondition(conditionJSON.parameters[1], returnFiles, propertyNameArray, thisRulePropertyNameMap, indentLevel + 1)
                // TODO: check typeof euidString and typeof nameString, error if they are not Number or String
                var propertyName = ''
                var files = {
                    ruleFile: euidString,
                    listFile: nameString
                }

                cleanupFiles(files, indentLevel)
                // strip leading spaces
                euidString = euidString.replace(/ /g, '')
                nameString = nameString.replace(/ /g, '')
                // workaround old DF code that does not provide EUID 0000000000000000
                if (nameString.match(/ep_0:sRule:/) && euidString == '') {
                    euidString = '0000000000000000'
                }
                propertyName =
                    euidString.replace(/\"/g, '')
                    + '-'
                    + nameString.replace(/\"/g, '')

                addUniquePropertyName(propertyName, propertyNameArray)
                if (!thisRulePropertyNameMap[propertyName]) {
                    var nextBindValueString = config.bindValueTemplateArray.join('')

                    thisRulePropertyNameMap[propertyName] = 'V' + thisRulePropertyNameMap.__nextName__
                    thisRulePropertyNameMap.__nextName__ += 1
                    propertyName = thisRulePropertyNameMap[propertyName]
                    nextBindValueString = nextBindValueString.replace(/#euidHere#/g, euidString)
                    // I was asked to remove reference to specific internal properties
                    // I created an object in config.noOldValueByPropertyName that containes property names with value true if they are to be excluded.    false or non existent means to include them

                    if (config.noOldValueByPropertyName[nameString]) { // special case internal and ep_0:sRule:TimerActived_
                        // nextBindValueString = nextBindValueString.replace(/\(EUID E\)/,'')     
                        nextBindValueString = nextBindValueString.replace(/\(OldValue [^\)]*\)/, '')
                        nextBindValueString = nextBindValueString.replace(/\(Detected [^\)]*\)/, '')
                    }
                    nextBindValueString = nextBindValueString.replace(/#nameHere#/g, nameString)
                    nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyName)
                    returnFiles.ruleFile = returnFiles.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')
                } else {
                    propertyName = thisRulePropertyNameMap[propertyName]
                }
                returnSubStrings.ruleFile = returnSubStrings.ruleFile.replace(/#propertyNameHere#/g, propertyName)
                // Unless it was GetOldValue
                if (conditionJSON.op == 'GetOldValue') {
                    // then if the property doesn't have an OldValue return 'NA'
                    if (config.noOldValueByPropertyName[nameString]) {
                        returnSubStrings.ruleFile = 'NA'
                    }
                }
                break
            case 'Number':
            case 'String':
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace(/#constantHere#/g, conditionJSON.parameters[0])
                break
            default:
                returnSubStrings.ruleFile += '#indentLevel#(eq 1 0); #nextErrorHere#'
                returnError(
                    'ERROR UNKNOWN op "' + conditionJSON.op + '"',
                    returnSubStrings
                )
        } // end switch(conditionJSON.op)

        cleanupFiles(returnSubStrings, indentLevel)

        // append log of returnSubStrings to returnFiles
        returnFiles.log = returnFiles.log.concat(returnSubStrings.log)

        return returnSubStrings.ruleFile
    } // end function xformRuleCondition()

    function xformRuleActionArray(ruleActionArray, returnFiles, propertyNameArray, thisRulePropertyNameMap) {
        var length = ruleActionArray && ruleActionArray.length

        if (!length) {
            returnError('ruleActionArray is 0 length or not an Array.', returnFiles)
            return
        } else {
            for (var i = 0; i < ruleActionArray.length; i++) {
                xformRuleAction(ruleActionArray[i], returnFiles, propertyNameArray, thisRulePropertyNameMap)
            }
        }
    }

    function xformRuleFormPorpertyName(extractJSON) {
        var propertyName = ''
        var euidString = ''
        var nameString = ''
        var nextBindValueString = ''
        if (extractJSON.parameters[0].string != undefined && extractJSON.parameters[1].string != undefined) {
            euidString = JSON.stringify(extractJSON.parameters[0].string)
            nameString = JSON.stringify(extractJSON.parameters[1].string)
            euidString = euidString.replace(/\[|]|"| /g, '')
            nameString = nameString.replace(/\[|]|"| /g, '')

            if (nameString.match(/ep_0:sRule:/) && euidString == '') {
                euidString = '0000000000000000'
            }
            propertyName =
                euidString.replace(/\"/g, '')
                + '-'
                + nameString.replace(/\"/g, '')
        }
        return [propertyName, euidString, nameString]
    }

    function xformRuleAddEUIDIntoArray(actionJSON, propertyNameArray, thisRulePropertyNameMap, returnFiles) {
        var propertyName = ''
        if (propertyNameArray != undefined) {
            propertyName = xformRuleFormPorpertyName(actionJSON)
            if (propertyName[0] != '') {
                addUniquePropertyName(propertyName[0], propertyNameArray)
                /* sigma: added declaration even it is not defined in if*/
                var nextBindValueString = ''
                nextBindValueString = config.bindValueTemplateArray.join('')
                nextBindValueString = nextBindValueString.replace(/#euidHere#/g, propertyName[1])
                if (config.noOldValueByPropertyName[propertyName[1]]) {
                    nextBindValueString = nextBindValueString.replace(/\(OldValue [^\)]*\)/, '')
                    nextBindValueString = nextBindValueString.replace(/\(Detected [^\)]*\)/, '')
                }
                nextBindValueString = nextBindValueString.replace(/#nameHere#/g, propertyName[2])
                nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, thisRulePropertyNameMap[propertyName[0]])
                returnFiles.ruleFile = returnFiles.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')
                //
            }
        }
    }

    function xformRuleAddNewVariable(thisRulePropertyNameMap, propertyName) {
        if (!thisRulePropertyNameMap[propertyName]) {
            thisRulePropertyNameMap[propertyName] = 'V' + thisRulePropertyNameMap.__nextName__
            thisRulePropertyNameMap.__nextName__ += 1
        }
    }

    function xformRuleSelectSymbol(op) {
        var symbol = ''
        switch (op) {
            case 'ADD':
                symbol = '+'
                break;
            case 'SUB':
                symbol = '-'
                break;
            case 'MUL':
                symbol = '*'
                break;
            case 'DIV':
                symbol = '/'
                break;
            case 'LNOT':
                symbol = 'lnot'
                break;
            case 'LOR':
                symbol = 'lor'
                break;
            case 'LAND':
                symbol = 'land'
                break;
            case 'BAND':
                symbol = 'band'
                break;
            case 'BOR':
                symbol = 'bor'
                break;
            case 'BXOR':
                symbol = 'bxor'
                break;
            case 'BNOT':
                symbol = 'bnot'
                break;
            default:
                break;
        }
        return symbol
    }

    function xformRuleGetOperation(thisRulePropertyNameMap, paramObj, propertyNameArray, returnFiles) {
        var outputParaString = ''
        var variableName = ''
        var symbol = ''
        var temperaryName = ''
        var paramString = ''
        temperaryName = xformRuleFormPorpertyName(paramObj)
        if (temperaryName[0] == '') {
            for (var x = 0; x < paramObj.parameters.length; x += 1) {
                if (paramObj.parameters[x].number != undefined) {
                    paramString = paramString + ' ' + paramObj.parameters[x].number
                } else if (paramObj.parameters[x].string != undefined) {
                    paramString = paramString + ' ' + paramObj.parameters[x].string.replace(/"/g, '\\"')
                } else if (paramObj.parameters[x].quotedString != undefined) {
                    paramString = paramString + ' "' + paramObj.parameters[x].quotedString.replace(/"/g, '\\"') + '"'
                } else {
                    paramString = paramString + ' ' + xformRuleGetOperation(thisRulePropertyNameMap, paramObj.parameters[x], propertyNameArray, returnFiles)
                }
            }
        }
        symbol = xformRuleSelectSymbol(paramObj.op)
        if (temperaryName[0] != '') {
            if (thisRulePropertyNameMap[temperaryName[0]] == undefined) {
                xformRuleAddNewVariable(thisRulePropertyNameMap, temperaryName[0]) // sigma : generate variable by name to map
                xformRuleAddEUIDIntoArray(paramObj, propertyNameArray, thisRulePropertyNameMap, returnFiles)
            }
            variableName = '?' + thisRulePropertyNameMap[temperaryName[0]]
        }
        if (symbol != '') {
            if (variableName != undefined) {
                outputParaString = '(' + symbol + variableName + paramString + ')'
            } else {
                outputParaString = '(' + symbol + paramString + ')'
            }
        } else {
            if (variableName != undefined) {
                outputParaString = variableName + paramString
            } else {
                outputParaString = paramString
            }
        }
        return outputParaString
    }

    function xformRuleAction(inActionJSON, returnFiles, propertyNameArray, thisRulePropertyNameMap) {
        var returnSubStrings = {
            log: [],
            ruleFile: '#nextErrorHere#',
            listFile: '#nextErrorHere#'
        }
        var numParams
        var propertyName
        var actionJSON

        if (inActionJSON instanceof Object) {
            actionJSON = inActionJSON
        } else {
            actionJSON = {}
            returnError('actionJSON is not an Object', returnSubStrings)
        }

        numParams = actionJSON.parameters && actionJSON.parameters.length

        if (actionJSON.op == undefined) {
            returnError('actionJSON has no "op" key!', returnSubStrings)
        }

        if (config.actionTemplateByOp[actionJSON.op] && config.actionTemplateByOp[actionJSON.op].templateArray) {
            returnSubStrings.ruleFile =
                returnSubStrings.ruleFile.replace('#nextErrorHere#', config.actionTemplateByOp[actionJSON.op].templateArray.join(''))
            if (
                (numParams < config.actionTemplateByOp[actionJSON.op].minParameters)
                || (numParams > config.actionTemplateByOp[actionJSON.op].maxParameters)
            ) {
                returnError('invalid number of parameters for actionJSON.op "' + actionJSON.op + '"', returnSubStrings)
            }
        } else {
            returnError('No template for actionJSON.op "' + actionJSON.op + '"', returnSubStrings)
        }

        switch (actionJSON.op) {
            case 'SetValue':
            case 'CancelTimer':
            case 'ADD':
            case 'SUB':
                for (var i = 0; i < numParams; i += 1) {
                    var paramObj = actionJSON.parameters[i] || {}
                    var paramString = 'null'
                    var finalString = ''
                    // workaround bug in DF app that creates null parameter sometimes
                    // if (paramObj == null) {
                    //         paramObj = { "string" : "" }
                    // }
                    if (paramObj.op == undefined) {
                        if (paramObj.number != undefined) {
                            paramString = paramObj.number
                        } else if (paramObj.string != undefined) {
                            paramString = paramObj.string.replace(/"/g, '\\"')
                        } else if (paramObj.quotedString != undefined) {
                            paramString = '"' + paramObj.quotedString.replace(/"/g, '\\"') + '"'
                        } else {
                            returnError('parameter is not a number or a string ', returnSubStrings)
                        }
                        returnSubStrings.ruleFile =
                            returnSubStrings.ruleFile.replace('#p' + i + '#', paramString)
                    } else {
                        /////////////////sigma added the following to set variable as value/////////////////
                        finalString = xformRuleGetOperation(thisRulePropertyNameMap, paramObj, propertyNameArray, returnFiles) // sigma : generate the final string
                        returnSubStrings.ruleFile =
                            returnSubStrings.ruleFile.replace('\"#p' + i + '#\"', finalString)
                        /////////////////sigma added the above to set variable as value/////////////////
                    }
                }
                break
            case 'StartTimer':
                addUniquePropertyName('0000000000000000-ep_0:sRule:Timestamp_i', propertyNameArray)
                if (!thisRulePropertyNameMap['0000000000000000-ep_0:sRule:Timestamp_i']) {
                    var nextBindValueString = config.bindValueTemplateArray.join('')

                    thisRulePropertyNameMap['0000000000000000-ep_0:sRule:Timestamp_i'] = 'V' + thisRulePropertyNameMap.__nextName__
                    thisRulePropertyNameMap.__nextName__ += 1
                    propertyName = thisRulePropertyNameMap['0000000000000000-ep_0:sRule:Timestamp_i']
                    nextBindValueString = nextBindValueString.replace(/#euidHere#/g, '0000000000000000')
                    // I was asked to remove reference to specific internal properties
                    // I created an object in config.noOldValueByPropertyName that containes property names with value true if they are to be excluded.    false or non existent means to include them
                    if (config.noOldValueByPropertyName['ep_0:sRule:Timestamp_i']) {
                        // some internal properties should not bund OldValue and Detected
                        // nextBindValueString = nextBindValueString.replace(/\(EUID E\)/,'')
                        nextBindValueString = nextBindValueString.replace(/\(OldValue [^\)]*\)/, '')
                        nextBindValueString = nextBindValueString.replace(/\(Detected [^\)]*\)/, '')
                    }
                    nextBindValueString = nextBindValueString.replace(/#nameHere#/g, 'ep_0:sRule:Timestamp_i')
                    nextBindValueString = nextBindValueString.replace(/#propertyNameHere#/g, propertyName)
                    returnFiles.ruleFile = returnFiles.ruleFile.replace('#nextBindValueHere#', nextBindValueString + '#nextBindValueHere#')
                }
                else  //add by sannyzhang 2020-10-13
                {
                    propertyName = thisRulePropertyNameMap['0000000000000000-ep_0:sRule:Timestamp_i']
                }
                returnSubStrings.ruleFile =
                    returnSubStrings.ruleFile.replace('#propertyNameHere#', propertyName)
                for (var i = 0; i < numParams; i += 1) {
                    var paramObj = actionJSON.parameters[i]
                    var paramString = 'null'

                    if (paramObj.number != undefined) {
                        paramString = paramObj.number
                    } else if (paramObj.string != undefined) {
                        paramString = paramObj.string.replace(/"/g, '\\"')
                    } else if (paramObj.quotedString != undefined) {
                        paramString = '"' + paramObj.quotedString.replace(/"/g, '\\"') + '"'
                    } else {
                        returnError('parameter is not a number or a string ', returnSubStrings)
                    }
                    returnSubStrings.ruleFile =
                        returnSubStrings.ruleFile.replace('#p' + i + '#', paramString)
                }
                break
            default:
                returnError('Unrecognized actionJSON.op "' + actionJSON.op + '"', returnSubStrings)
        }

        // remove error and other place holders
        cleanupFiles(returnSubStrings)
        // update returnFiles with what we found
        returnFiles.ruleFile =
            returnFiles.ruleFile.replace('#nextActionHere#', returnSubStrings.ruleFile + '#nextActionHere#')
        // append log of returnSubStrings to returnFiles
        returnFiles.log = returnFiles.log.concat(returnSubStrings.log)
    }

    //sean add:  2016.4.5
    String.prototype.repeat = function (n) {
        n = n || 1;
        return Array(n + 1).join(this);
    }


   
    let returnFiles = xformRuleFileJSON(jsondata);
  
    returnFiles.ruleFile = returnFiles.listFile.replace(/^/g, ';').replace(/\n/g, '\n;') + returnFiles.ruleFile

    //var str = JSON.stringify( returnFiles.ruleFile); 
    //console.log(returnFiles.ruleFile);
    // fs.writeFile(clpfile,'',function(err){
    //         fs.appendFile(clpfile,  returnFiles.ruleFile,'utf-8', function(err){ //writeFile
    //                 console.log("finish!");
    //                 process.kill(process.pid, 'SIGINT');
    //         });
    // });

    return returnFiles.ruleFile


}

const getRandomString = function () {
  const uid = uuidV4();
  const rval = uid.toString();
  return rval;
};

module.exports = { getRandomString,clpConvert };
