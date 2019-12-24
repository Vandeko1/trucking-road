<template>
    <Page class="page" xmlns="http://www.nativescript.org/tns.xsd" xmlns:calendar="nativescript-ui-calendar">
        <ActionBar class="action-bar">
            <NavigationButton ios:visibility="collapsed" icon="res://menu" @tap="onDrawerButtonTap"></NavigationButton>
            <ActionItem icon="res://navigation/menu" 
                android:visibility="collapsed" 
                @tap="onDrawerButtonTap"
                ios.position="left">
            </ActionItem>
            <Label class="action-bar-title" text="Календар"></Label>
        </ActionBar>
      <RadCalendar id="calendar" 
          :eventSource="calendarEvents" 

          eventsViewMode="Inline" 
          selectionMode="Single" 
          viewMode="Month"
          transitionMode="Stack" 
          locale="en-US" 
          
          @dateSelected="onDateSelected" 
          @dateDeselected="onDateDeselected" 
          @navigatedToDate="onNavigatedToDate"
          @navigatingToDateStarted="onNavigatingToDateStarted" 
          @viewModeChanged="onViewModeChanged" />
    </Page>
</template>

<script>
import * as utils from "~/shared/utils";
import SelectedPageService from "../shared/selected-page-service";
    
import * as calendarModule from 'nativescript-ui-calendar';
import { Color } from 'color';
export default {
    mounted() {
        SelectedPageService.getInstance().updateSelectedPage("Calendar");
    },
    methods: {
        onNavigationButtonTap() {
            Frame.topmost().goBack();
        },

        onDateSelected(args) {
          console.log("onDateSelected: " + args.date);
        },

        onDateDeselected(args) {
          console.log("onDateDeselected: " + args.date);
        },

        onNavigatedToDate(args) {
          console.log("onNavigatedToDate: " + args.date);
        },

        onNavigatingToDateStarted(args) {
          console.log("onNavigatingToDateStarted: " + args.date);
        },

        onViewModeChanged(args) {
          console.log("onViewModeChanged: " + args.newValue);
        }
  },
  created() {
    let events = [];
    let now = new Date();
    let startDate;
    let endDate;
    let event;
    let colors = [new Color(200, 188, 26, 214), new Color(220, 255, 109, 130), new Color(255, 55, 45, 255), new Color(199, 17, 227, 10), new Color(255, 255, 54, 3)];
    for (let i = 1; i < 10; i++) {
      startDate = new Date(now.getFullYear(), now.getMonth(), i * 2, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), (i * 2), 3);
      event = new calendarModule.CalendarEvent("event " + i, startDate, endDate, false, colors[i * 10 % (colors.length - 1)]);
      events.push(event);
      if (i % 3 == 0) {
        event = new calendarModule.CalendarEvent("second " + i, startDate, endDate, true, colors[i * 5 % (colors.length - 1)]);
        events.push(event);
      }
    }
    this.calendarEvents = events;
  },
  data() {
    return {
      calendarEvents: []
    }
  },
};