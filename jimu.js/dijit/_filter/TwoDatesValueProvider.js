///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/Evented',
  'dojo/on',
  'dojo/_base/html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  './ValueProvider',
  'dijit/_WidgetsInTemplateMixin',
  './DateValueSelector',
  'dojo/text!./TwoDatesValueProvider.html',
  'jimu/utils'
],
  function(Evented, on, html, declare, lang, ValueProvider, _WidgetsInTemplateMixin,
    DateValueSelector, template, jimuUitls) {

    return declare([ValueProvider, _WidgetsInTemplateMixin, Evented], {

      templateString: template,
      customId: null, //optional, for screen readers

      postCreate: function(){
        this.inherited(arguments);
        this.customId = this.partObj.vpId;
        html.addClass(this.domNode, 'jimu-two-dates-filter-value-provider');

        var opts1 = {
          runtime: this.runtime,
          popupInfo: this.popupInfo,
          _fieldInfo: this.fieldInfo,
          style:{"width":"100%"}
        };
        var opts2 = lang.clone(opts1);
        var opts2_id;
        if(this.customId){
          opts1.customId = this.customId + '_between';
          opts1.prompt = this.partObj.interactiveObj.prompt + ' ' + this.partObj.interactiveObj.hint;
          opts2_id = this.customId;
        }else{
          opts2_id = jimuUitls.getUUID();
        }
        opts2.customId = opts2_id + '_and';
        opts2.prompt = this.nls.and;

        if(this.runtime){
          opts1.virtualDates = this.partObj.interactiveObj.virtualDates1;
          opts2.virtualDates = this.partObj.interactiveObj.virtualDates2;
        }

        this._dijit1 = new DateValueSelector(opts1, this._dijitDiv1);
        this._dijit2 = new DateValueSelector(opts2, this._dijitDiv2);

        //bind change event
        this.own(on(this._dijit1, 'change', lang.hitch(this, function(date){
          this.emit('change', date, 'start');
        })));
        this.own(on(this._dijit2, 'change', lang.hitch(this, function(date){
          this.emit('change', date, 'end');
        })));
      },
      _initDateSelectors:function(){
      },

      // _onRangeDateBlur:function(){
      //   if(this._dijit1.validate() && this._dijit2.validate()){
      //     var date1 = this._dijit1.get('value');
      //     var time1 = date1.getTime();
      //     var date2 = this._dijit2.get('value');
      //     var time2 = date2.getTime();
      //     if(time1 > time2){
      //       this._dijit1.set('value', date2);
      //       this._dijit2.set('value', date1);
      //     }
      //   }
      // },

      _onDateValueSelectorChanged: function(){
        this.emit('change');
      },

      getDijits: function(){
        return [this._dijit1, this._dijit2];
      },

      setValueObject: function(valueObj){
        this._setValueObject(this._dijit1, valueObj, 1);
        this._setValueObject(this._dijit2, valueObj, 2);
      },

      _setValueObject: function(dateValueSelector, valueObj, index){
        //valueName is 'value1' or 'value2'
        var valueName = 'value' + index;
        if(this.isDefined(valueObj[valueName])){
          var dateValueObject = {
            enableTime: valueObj['enableTime' + index],
            timeAccuracy: valueObj['timeAccuracy' + index],
            value: null,
            virtualDate: ''
          };
          dateValueObject.value = valueObj[valueName];
          dateValueObject.virtualDate = valueObj['virtualDate' + index];
          dateValueSelector.setValueObject(dateValueObject);
        }
      },

      getValueObject: function(){
        if(this.isValidValue()){
          var dateValueObject1 = this._dijit1.getValueObject();
          var dateValueObject2 = this._dijit2.getValueObject();
          if(dateValueObject1.value && dateValueObject2.value){
            return {
              "isValid": true,
              "type": this.partObj.valueObj.type,
              "enableTime1": dateValueObject1.enableTime ? true : false,
              "timeAccuracy1": dateValueObject1.timeAccuracy ? dateValueObject1.timeAccuracy : '',
              "enableTime2": dateValueObject2.enableTime ? true : false,
              "timeAccuracy2": dateValueObject2.timeAccuracy ? dateValueObject2.timeAccuracy : '',
              "value1": dateValueObject1.value,//date string
              "value2": dateValueObject2.value,//date string
              "virtualDate1": dateValueObject1.virtualDate,//today,yesterday,...
              "virtualDate2": dateValueObject2.virtualDate//today,yesterday,...
            };
          }else{
            return null;
          }
        }
        return null;
      },

      tryGetValueObject: function(){
        if(this.isValidValue()){
          return this.getValueObject();
        }else if(this.isEmptyValue()){
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value1": null,//date string
            "value2": null,//date string
            "virtualDate1": null,//today,yesterday,...
            "virtualDate2": null//today,yesterday,...
          };
        }
        return null;
      },

      //-1 means invalid value type
      //0 means empty value, this ValueProvider should be ignored
      //1 means valid value
      getStatus: function(){
        if(this._dijit1.getStatus() === 1 && this._dijit2.getStatus() === 1){
          return 1;
        }else if(this._dijit1.getStatus() === -1 || this._dijit2.getStatus() === -1){
          return -1;
        }else{
          return 0;
        }
      },

      setRequired: function(required){
        this._dijit1.set("required", required);
        this._dijit2.set("required", required);
      }

    });
  });