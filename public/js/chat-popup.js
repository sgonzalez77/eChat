$(document).ready(function () {
  console.log('hi0');
  $('.left-first-section').click(function () {
    console.log('hi1');
    $('#popup-chat-1').toggleClass('open-more');
  });
  $('.fa-minus').click(function () {
    console.log('hi2');
    $('#popup-chat-1').toggleClass('open-more');
  });
  $('.fa-times').click(function () {
    console.log('hi3');
    // $('#popup-chat-1').toggleClass('open-more');
  });
});
