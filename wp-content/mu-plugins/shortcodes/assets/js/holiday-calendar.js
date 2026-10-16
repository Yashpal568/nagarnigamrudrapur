(function ($) {

	$.fn.sHolidayCalender = function (options) {

		let $this = this;
		let containerClass = "scalendar-container";
		let headerClass = "scalendar-header";
		let calendarTable = $('<table class="no-responsive"></table>');

		let settings = $.extend({
			datesArray: [],
			holidayTypes: [],
			containerClass: "",
			headerClass: "",
			prevMonthText: "Previous Month",
			nextMonthText: "Next Month",
			satOff: 1,
			satoffStartsFrom: '',
			holidayOnlyTexColor: false,
			caption: ''
		}, options);

		if(settings.caption.trim() != '') calendarTable.append('<caption>'+ settings.caption +'</caption>')

		let calendarContainer = $('<div />').addClass(containerClass + ' ' + settings.containerClass + ' ' + $this.attr('class'));
		calendarContainer.prepend('<div class="sc-loader"><span><i class="fa fa-spinner fa-spin"></i></span>');

		const nth = function (d) {
			if (d > 3 && d < 21) return d + "th";
			switch (d % 10) {
				case 1: return d + "st";
				case 2: return d + "nd";
				case 3: return d + "rd";
				default: return d + "th";
			}
		}

		let months = HolidayData.monthsList || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		let currentDate = new Date(); currentDate.setHours(0, 0, 0, 0);
		let currentYear = currentDate.getFullYear();
		let currentMonth = currentDate.getMonth();


		/* Generate List Of Days */

		let getDaysHtml = function (month, year, holidays) {

			let days =  ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
			let startDate = new Date(year, month - 1, 1);
			let daysArray = [];

			while (startDate.getMonth() == month - 1) {
				daysArray.push({
					id: startDate.getDate(),
					day: days[startDate.getDay()],
					month: startDate.getMonth(),
					date: startDate.getDate(),
					fullDate: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) })
				startDate.setDate(startDate.getDate() + 1);
			}

			let daysContainer = $('<tbody></tbody>');
			let dayStartsAt = days.indexOf(daysArray[0].day);
			let lastDay = 7;
			let saturdays = [];
			let saturdays_off = [];
			let blankLiCount = 0;
			let calendarRow = $('<tr />');


			/*Add blank td untill day starts for the month*/
			for (let i = 0; blankLiCount < dayStartsAt; i++) {
				let td = $('<td aria-hidden="true" class="blank-date" />').append($('<span />'));
				calendarRow.append(td);
				blankLiCount++;
			}
			/*Add blank td untill day starts for the month*/

			/*all saturdays*/
			for (let i = 0; i < daysArray.length; i++) {
				if (daysArray[i].day == 'sat') {
					saturdays.push(daysArray[i].id);
				}
			}
			/*all saturdays*/

			/*prepare which saturdays are off*/
			for (let i = 0; i < daysArray.length; i++) {
				let isSatOff = false;

				switch (settings.satOff) {
					case '1':
						isSatOff = true;
						break;
					case '2':
						isSatOff = (i != 4 && i % 2 == 0)
						break;
					case '3':
						isSatOff = (i == 1 || i == 2);
						break;
					case '4':
						let satoffStartsFrom = (settings.satoffStartsFrom != '') 
							? new Date(settings.satoffStartsFrom) 
							: new Date(1947, 0, 1);

						const startYear  = satoffStartsFrom.getFullYear();
						const startMonth = satoffStartsFrom.getMonth();
						const startDate  = satoffStartsFrom.getDate();

						if (year > startYear) {
							isSatOff = (i % 2 === 1);
						} 
						else if (year === startYear) {
							if (month > startMonth + 1) {
								isSatOff = (i % 2 === 1);
							} 
							else if (month === startMonth + 1) {
								isSatOff = (i % 2 === 1 && saturdays[i] > startDate);
							}
						}
						break;
					case '5':
						isSatOff = (i == 1);
						break;
					case '6':
						isSatOff = (i % 2 == 0);
						break;
				}
				if(isSatOff) saturdays_off.push(saturdays[i]);
			}
			/*prepare which saturdays are off*/

			/* Loop thorow all the days and generate td accordingly*/
			let filledTd = 1;

			for (let i = 0; i < daysArray.length; i++) {

				let holidayForThisDay = [];
				let td = $('<td />').text(daysArray[i].id);
				let tdTooltips = [];
				let tdClasses = [];
				let fullDate = nth(daysArray[i].fullDate.getDate()) + ' ' + months[month - 1] + ' ' + daysArray[i].fullDate.getFullYear();
				/* Start row*/
				if( ( i + blankLiCount ) % 7 == 0 ){
					calendarRow = $('<tr />');
					filledTd = 1;
				}
				/* Start row*/


				/* loop var i == Todays Date*/
				if (currentDate.getDate() === daysArray[i].id && year == currentDate.getFullYear() && (month - 1) == currentDate.getMonth()) {
					tdClasses.push('current-date');
					td.addClass('current-date').attr("aria-current", "date");
				}

				/* Holiday Classes*/

				/* Get holidays for this day */
				$.each(holidays, function (key, holiday) {
					holiday.end_date.setHours(0, 0, 0, 0);
					holiday.start_date.setHours(0, 0, 0, 0);
					if (daysArray[i].fullDate.getTime() >= holiday.start_date.getTime() && daysArray[i].fullDate.getTime() <= holiday.end_date.getTime()){
						/*if(holiday.type == 'weekend-working'){td.removeClass('weekend');}*/
						holidayForThisDay.push(holiday);
					}
				})
				/* Get holidays for this day */


				/* Loop Throw all the holidays for this day*/

				if (holidayForThisDay.length > 0) {

					td.addClass('has-holidays');
					$.each(holidayForThisDay, function (key, holiday) {
						td.addClass(holiday.type);
						let tootltipTitle = holiday.title;
						if(holiday.type == 'gazetted') tootltipTitle +=  ' - ' +settings.gazettedHolidayText;
						else if(holiday.type == 'restricted') tootltipTitle +=  ' - ' +settings.restrictedHolidayText
						
						tdTooltips.push(tootltipTitle)
					})

					if (holidayForThisDay.length > 1) td.addClass('multiple');

					let holidaysTitleForThisDay = holidayForThisDay.map(item => item.title);

					/*$.each(holidayForThisDay, function (key, holiday) {
						holidaysTitleForThisDay.push(holiday.title)
						holidaysForThisDay += '<p>' + holiday.title + '</p>';
					})*/

					if(holidaysTitleForThisDay.length > 0){
						td.wrapInner('<a role="presentation" href="javascript:void(0);" class="holidaysTag" aria-label="'+ holidaysTitleForThisDay.join(',') + ' ' + fullDate +'"></a>');
					}

					let date = daysArray[i].fullDate.toLocaleDateString('en-US').split('/');
					td.find('a').data('clickedDate', date[2] + String(date[0]).padStart(2, '0') + String(date[1]).padStart(2, '0'));
				}

				//td.find('a').attr('title', fullDate );
				//td.attr('data-date',fullDate);


				/* Weekend Classes*/

				if (daysArray[i].day == 'sun') {
					td.addClass('weekend sunday');
					if(!td.hasClass('has-holidays')){
						td.attr({'aria-label': settings.weeklyHolidayText+ ' '+ fullDate,'tabindex': '0'});
					}else{
						td.find('a').attr({'aria-label': settings.weeklyHolidayText + ', ' + tdTooltips.join(',') +' '+ fullDate});
					}
					tdTooltips.push(settings.weeklyHolidayText);
				}

				if (daysArray[i].day == 'sat')	td.addClass('saturday');

				if (saturdays_off.indexOf(daysArray[i].id) != -1){
					td.addClass('weekend');
					if(!td.hasClass('has-holidays')){
						td.attr({'aria-label': settings.weeklyHolidayText +' '+ fullDate,'tabindex': '0'});
					}else{
						td.find('a').attr({'aria-label': settings.weeklyHolidayText + ', ' + tdTooltips.join(',') +' '+ fullDate});
					}
					if(!td.hasClass('weekend-working')) {
						tdTooltips.push(settings.weeklyHolidayText);
					}

				}

				if(i == (daysArray.length - 1) && filledTd == 7){
					td.addClass('last-seven');
				}

				filledTd++;

				if(tdTooltips.length > 0){
					td.append('<div class="h-tooltip">' + tdTooltips.join(',') + '</div>');
				}

				calendarRow.append(td);
				daysContainer.append(calendarRow);
				lastDay = days.indexOf(daysArray[i].day);
			}
			/* Loop thorow all the days and generate td accordingly*/

			return daysContainer.html();

		}

		if($this.outerWidth() > 992){
			$this.addClass('calendarBig');
		}


		/* Header Next/Previous & Month Name */
		let header = $('<div />').addClass(headerClass + ' ' + settings.headerClass).data('visibleDate', currentDate);

		header.append('<a aria-label="' + settings.prevMonthText + '" role="button" href="javascript:void(0)" class="scalendar-prev fa fa-angle-left" title="' + settings.prevMonthText + '">')
			.append('<div class="scalendar-month-name">' + months[currentMonth] + " " + currentYear + '</div>')
			.append('<a aria-label="' + settings.nextMonthText + '" role="button" href="javascript:void(0)" class="scalendar-next fa fa-angle-right" title="' + settings.nextMonthText + '">');

		calendarContainer.append(header);


		/* Header List Of Days Name */

		let days = HolidayData.daysList ||  ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		let daysHeadContainer = $('<thead class="scalendar-header-days-name" />');
		let daysHead = $('<tr />');

		$.each(days, function (index, value) {
			let th = $('<th scope="col" />').append($('<span />').text(value.toUpperCase()));
			daysHead.append(th);
		})

		daysHeadContainer.append(daysHead);
		calendarTable.append(daysHeadContainer);

		/* Calender Dates */

		let daysList = $('<tbody class="calendar-days-inner scalendar-days-list"  />');
		if(settings.holidayOnlyTexColor){
			daysList.addClass('holiday-text-color-only');
		}
		calendarTable.append(daysList);
		let generateCalendar = function (year, month) {
			$.ajax({
				async: true,
				url: window.ajaxUrl,
				method: 'GET',
				data: { action: 'calendar_get_holidays_for_this_month', year: year, month: String(month).padStart(2, '0'),lang: HolidayData.currentLang },
				beforeSend: function () {
					$('.sc-loader').show();
					header.find('.scalendar-prev,.scalendar-next').addClass('disabled');
					$('#sc-site-notification').html('Loading holidays for '+ months[month-1] + " " + year);
				},
				success: function (response) {
					let holidays = $.map(response.data.holidays, function (val, i) {
						val['start_date'] = new Date(val['start_date'].split('/').reverse().join('-'));
						val['end_date'] = new Date(val['end_date'].split('/').reverse().join('-'));
						return val;
					});

					$('#sc-site-notification').html('Loading Complete');

					/* List Of Days */
					let daysUl = getDaysHtml(month, year, holidays);
					daysList.html(daysUl);
					$('.sc-loader').hide();
					header.find('.scalendar-prev,.scalendar-next').removeClass('disabled');
				}
			})
		}
		generateCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);


		/* Holidays Holder */

		let holidaysHolder = $('<div />').addClass('scalendar-holidays-by-date');
		holidaysHolder.append('<div class="scalendar-holidays-date-heading">holidays</div>');
		holidaysHolder.append('<a class="sc-back sc-holiday-btn"><i class="fa fa-arrow-circle-left"></i></a><a class="sc-close sc-holiday-btn"><i class="fa fa-times-circle"></i></a>');
		let holidaysListHolder = $('<div class="sc-holidays-list" />').html('Loading Holidays..');
		holidaysHolder.append(holidaysListHolder);

		let holidaysTypeInfo = $('<tfoot />').addClass('holiday-type-info');
		let holidaysTypeInfoRow = $('<tr><td colspan="7"></td></tr>')
		let holidayTypesWidth = (settings.holidayTypes.length > 0) ? Math.round((100 / settings.holidayTypes.length)) : 100;
		$.each(settings.holidayTypes, function (index, value) {
			holidaysTypeInfoRow.find('td').append('<div class="holiday-type" style="width:'+ holidayTypesWidth +'%"><span></span>' + value.name + '</div>');
		})

		holidaysTypeInfo.append(holidaysTypeInfoRow);

		calendarTable.append(holidaysTypeInfo);
		calendarContainer.append(calendarTable);
		$this.replaceWith(calendarContainer);

		/* On Click Previous/Next Button */
		$("body").on("click", ".scalendar-prev,.scalendar-next", function () {

			let visibleDate = $(this).parents('div').data('visibleDate');
			let date = new Date(visibleDate);

			if ($(this).hasClass('scalendar-prev')) date.setMonth(date.getMonth() - 1)
			else date.setMonth(date.getMonth() + 1)

			generateCalendar(date.getFullYear(), date.getMonth() + 1);

			$(calendarContainer).find('.scalendar-month-name').html(months[date.getMonth()] + " " + date.getFullYear());

			$(this).parents('div').data('visibleDate', date);

		});

		/* Handle tooltip which has holidaya and a anchor tag*/
		calendarContainer.on('focus mouseenter', '.holidaysTag', function () {
			//$(calendarContainer).find('#calender-status').html($(this).siblings('.h-tooltip').html()+' - '+ $(this).attr('title'));
			$(this).siblings('.h-tooltip').show();
		});
		calendarContainer.on('click', '.holidaysTag', function () {
			$(this).siblings('.h-tooltip').toggle();
		});
		calendarContainer.on('blur mouseleave', '.holidaysTag', function () {
			$(this).siblings('.h-tooltip').hide();
		});
		calendarContainer.on('keydown', '.holidaysTag', function (event) {
			if (event.key === "Escape" || event.which === 27 ) {
				$(this).siblings('.h-tooltip').hide();
			}
		});

		/* Handle tooltip for weekends*/
		calendarContainer.on('focus mouseenter', 'td.weekend:not(.has-holidays)', function () {
			//$(calendarContainer).find('#calender-status').html($(this).find('.h-tooltip').html() + ' - ' +$(this).attr('data-date'));
			$(this).find('.h-tooltip').show();
		});
		calendarContainer.on('keydown', 'td.weekend:not(.has-holidays)', function (event) {
			if (event.which === 13) {
				$(this).find('.h-tooltip').toggle();
			}

		});
		calendarContainer.on('blur mouseleave', 'td.weekend:not(.has-holidays)', function () {
			$(this).find('.h-tooltip').hide();
		});
		calendarContainer.on('keydown', 'td.weekend:not(.has-holidays)', function (event) {
			if (event.key === "Escape" || event.which === 27 ) {
				$(this).find('.h-tooltip').hide();
			}
		});

		return this;
	};

}(jQuery));