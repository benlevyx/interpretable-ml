<!-- All the places that need to be filled in are marked with TODO -->

<!--
    LabintheWild study template

    authors: Krzysztof Gajos
-->
<?php

require_once("config.php");
// presumes that the utils project is checked out in a sibling directory
require_once("../utils/php/utils.php");
// sessionflow is the library for tracking user's interactions with the study
require_once("sessionflow.php");
// infrastructure for creating surveys
require_once("survey.php");

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html">
<head lang="en">
    <title><!-- TODO: Study title goes here--></title>


    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- the following line controls how the page renders on mobile devices -->
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">

    <!-- open graph tags used to inform social media sites what to show if someone shares this page -->
    <meta name="twitter:card" content="summary"/>
    <!-- this line is needed for Twitter to render a nice preview of the page-->
    <!-- make sure the image is at least 200x200px; FB won't show smaller images -->
    <meta property="og:image" content=""/><!-- TODO url of an image to be shown on FB and Twitter when this page is shared -->
    <meta property="og:site_name" content="Lab in the Wild"/>
    <meta property="og:title" content=""/><!-- TODO name of this test -->
    <meta property="og:url" content=""/><!-- TODO URL of this test -->
    <meta property="og:description" content=""/><!-- TODO the text to advertise the test goes here; e.g., How good are you at predicting the weather? Find out and compare yourself to others. This test takes about 10 minutes.-->

    <!-- all the libraries you depend on; a lot of our utilities code relies on jQuery and Bootstrap; some use underscore as well -->
    <!-- feel free to update those to the newer versions as they come out -->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js"></script>
    <!-- we use the following library to submit form contents asynchronously -->
    <script type="text/javascript" src="../utils/js/jquery.form.js"></script>
    <!-- Materialize icons  -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- library for manipulating cookies -->
    <script src="https://d3js.org/d3.v5.min.js" charset="utf-8"></script>
    <script src="js/libs/c3.min.js"></script>
    <script src="js/libs/pca.min.js"></script>

    <script src="js/utils.js"></script>
    <script src="js/constants.js"></script>

    <script src="js/components/vis.js"></script>
    <script src="js/components/confusionMatrixVis.js"></script>
    <script src="js/components/featureImportanceVis.js"></script>
    <script src="js/components/histogramVis.js"></script>
    <script src="js/components/learningCurveVis.js"></script>
    <script src="js/components/scatterVis.js"></script>


    <script src="../utils/external/js.cookie.js"></script>
    <!-- making HTML 5 canvas drawings high resolution if running on a retina display -->
    <script src="../utils/external/hidpi-canvas.js"></script>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <!-- our own libraries -->
    <script src="../utils/js/utils.js"></script><!- general utilities -->
    <script src="template.js"></script><!-- example code for this template study -->
    <link rel="stylesheet" type="text/css" href="template.css"/><!-- starter CSS sheet -->
    <link rel="stylesheet" type="text/css" href="c3.min.css"/><!-- starter CSS sheet -->
    <script src="../utils/js/sessionflow2.js"></script><!-- this is our basic analytics software -->
    <script src="../utils/js/progress.js"></script><!-- library for visualizing progress through the study -->
    <!-- styling and javascript code for the surveys -->
    <link rel="stylesheet" type="text/css" href="../utils/survey/survey.css" />
    <script src="../utils/survey/survey.js"></script>
    <link rel="stylesheet" href="introjs.css"/>
    <!-- library for tutorials  -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.9.3/intro.min.js"></script>

    <!-- code for social media sharing -->
    <script src="https://www.labinthewild.org/share/share.js"></script>
    
    <!-- <script src="js/libs/d3.min.js"></script> -->
    
    <?php
    // initialize our analytics software for tracking participant behavior
    embeddedSessionFlowStart();
    ?>

    <script>
        // participantID is a global variable; in most studies we initialize it with a real value after demographics
        // questionnaire is submitted
        var participantID = "-1";
        $(function () {
            // this function sets up a checker that monitors the size of the browser window. If the size becomes smaller
            // than the width and height parameters supplied, a warning will automatically pop up. You can also supply
            // additional custom warning text.
            // TODO fill in the width, height and optional additional warning parameters below (or comment out this function)
            enableWindowSizeCheck(770, 500,
                "<p>If you are using a tablet (e.g., an iPad), please rotate it into landscape mode.</p>"
                + "<p>This experiment will not work on a phone.</p>");

            // Show the splash page (and hide all others)
            viewPage("#splash_page");
            // make social media sharing buttons -- calling this function will place social media buttons inside every
            // tag of class "share_this"
            share.gplus = false; // we no longer use Google+
            share.makeButtons(".share_this");
            // re-running installListeners() to ensure that the social media sharing buttons have analytics listeners
            // attached to them
            sessionFlow.installListeners();
        });
    </script>
</head>
<body>


<!-- **************  Progress visualization **************** -->
<div id="progressBar" class="w800"></div>

<!-- ********************* SPLASH PAGE *********************** -->
<div id="splash_page" class="page w800">

    <div class="header">
        <a href="https://www.labinthewild.org">
            <img src="https://www.labinthewild.org/studies/common/img/logo.png" alt="Lab in the wild logo" class="logo">
        </a>
        <span class="share_text">Tell your friends about this test!</span>
        <div class="share_this"></div>
        <div class="separator"> &nbsp; </div>
    </div>

    <div>
        <!-- TODO fill out the contents of the splash page -->
        <H1>Model Visualization Quiz!</H1>
        <p>In this study, you will interact with a list of visualization and then 
            diagnose model errors with these visualizations. 
            <?php
            // Optionally, tell people how many others have taken this test so far
            $numParticipants = getAutoIncrementValueForTable(DATABASE, "participants");
            echo "<p>$numParticipants people have taken this test so far.</p>";
            ?>
        </p>
        <p align="right">
            <button class="btn btn-primary btn-lg" id="splash_button">
                Start the test! <span class="material-icons">navigate_next</span>
            </button>
        </p>
    </div>
</div><!-- end splash_page -->



<!-- ********************* CONSENT PAGE *********************** -->
<div id="consent_page" class="page w800">
    <div class="separator2"></div>

    <h1><!-- TODO --> Model Visualization Quiz</h1>
    <p></p>

    <p><em>Please read the following information carefully before proceeding.</em></p>

    <!-- TODO consent form goes here -->

    <p>By clicking the "I agree" button you confirm that you have read and understood the above
        and agree to take part in this research. Your participation is voluntary and you are free
        to leave the experiment at any time by simply closing the web browser.</p>
    <p align="right"><button class="btn btn-primary btn-lg" id="consent_button">
            I agree <span class="material-icons">navigate_next</span>
        </button> </p>
</div><!-- end consent_page -->



<!-- ********************* DEMOGRAPHICS PAGE *********************** -->
<div id="demographics_page" class="page w800">
    <div class="separator2"></div>

    <h1>Please tell us a little bit about yourself.
        <a onclick="alert('We need this information for data analysis. Please note that none of the answers are personally identifiable. We take your privacy very seriously. You may email us at info@labinthewild.org for more information.');"> Why?</a>
    </h1>
    <form name="demo" id="demographics_form" action="demographics.php" method="POST">
        <!-- TODO make sure that the choice of the demographics questions makes sense for your study; decide which questions are important -->
        <!-- TODO if you add extra questions, make sure to modify demographics.php and the "participants" SQL table definition on config.php -->
        <p>These questions are <b>optional</b>, but if you could answer at least the first four,
            that would really help us.</p>

        <label for="retake">Have you taken this test before?</label>
        <select id="retake" name="retake">
            <option value=" "> </option>
            <option value="0">No</option>
            <option value="1">Yes</option>
        </select>
        <b>(important)</b>
        <br><br>

        <label for="age">How old are you?</label>
        <select id="age" name="age">
            <option value=" "> </option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option><option value="61">61</option><option value="62">62</option><option value="63">63</option><option value="64">64</option><option value="65">65</option><option value="66">66</option><option value="67">67</option><option value="68">68</option><option value="69">69</option><option value="70">70</option><option value="71">71</option><option value="72">72</option><option value="73">73</option><option value="74">74</option><option value="75">75</option><option value="76">76</option><option value="77">77</option><option value="78">78</option><option value="79">79</option><option value="80">80</option><option value="81">81</option><option value="82">82</option><option value="83">83</option><option value="84">84</option><option value="85">85</option><option value="86">86</option><option value="87">87</option><option value="88">88</option><option value="89">89</option><option value="90">90</option><option value="91">91</option><option value="92">92</option><option value="93">93</option><option value="94">94</option><option value="95">95</option><option value="96">96</option><option value="97">97</option><option value="98">98</option><option value="99">99</option><option value="100">100 or more</option>
        </select><b>(important)</b><br><br>


        <label for="gender">What is your gender?</label>
        <select id="gender" name="gender">
            <option value=" "> </option>
            <option value="0">male</option>
            <option value="1">female</option>
            <option value="2">non-binary</option>
        </select>
        <b>(important)</b>
        <br><br>

        <label for="comp_usage">How often do you use a computer?</label>
        <select id="comp_usage" name="comp_usage">
            <option value=" "> </option>
            <option value="1">Once a week or less</option>
            <option value="2">A few times a week</option>
            <option value="3">A couple of hours most days</option>
            <option value="4">Many hours on most days</option>
        </select>
        <br><br>

        <label for="education">What is the highest level of education you have received or are pursuing?</label>
        <select id="education" name="education">
            <option value=" "> </option>
            <option value="1-pre-high school">pre-high school</option>
            <option value="2-high school">high school</option>
            <option value="3-college">college</option>
            <option value="4-masters">Masters or professional degree</option>
            <option value="5-PhD">PhD (Doctorate)</option>
        </select><br><br>


        <label for="country_young">In what country did you live most of your childhood?</label>
            <select id="country_young" name="country_young"><option value=" "> </option><option value="Afghanistan">Afghanistan</option><option value="Aland Islands">Aland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua And Barbuda">Antigua And Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas">Bahamas</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia">Bolivia</option><option value="Bosnia And Herzegovina">Bosnia And Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory">British Indian Ocean Territory</option><option value="Brunei Darussalam">Brunei Darussalam</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cape Verde">Cape Verde</option><option value="Cayman Islands">Cayman Islands</option><option value="Central African Republic">Central African Republic</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option><option value="Colombia">Colombia</option><option value="Comoros">Comoros</option><option value="Congo">Congo</option><option value="The Democratic Republic Of The Congo">The Democratic Republic Of The Congo</option><option value="Cook Islands">Cook Islands</option><option value="Costa Rica">Costa Rica</option><option value="Cote Divoire">Cote Divoire</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Cyprus">Cyprus</option><option value="Czech Republic">Czech Republic</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic">Dominican Republic</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option><option value="Faroe Islands">Faroe Islands</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories">French Southern Territories</option><option value="Gabon">Gabon</option><option value="Gambia">Gambia</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-bissau">Guinea-bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island And Mcdonald Islands">Heard Island And Mcdonald Islands</option><option value="Holy See (Vatican City State)">Holy See (Vatican City State)</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran">Iran</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle Of Man">Isle Of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Democratic Peoples Republic of Korea">Democratic Peoples Republic of Korea</option><option value="Republic of Korea">Republic of Korea</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Lao Peoples Democratic Republic">Lao Peoples Democratic Republic</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia">Macedonia</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands">Marshall Islands</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia">Micronesia</option><option value="Republic of Moldova">Republic of Moldova</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="Netherlands Antilles">Netherlands Antilles</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger">Niger</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="Northern Mariana Islands">Northern Mariana Islands</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestinian Territory">Palestinian Territory</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines">Philippines</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Reunion">Reunion</option><option value="Romania">Romania</option><option value="Russian Federation">Russian Federation</option><option value="Rwanda">Rwanda</option><option value="Saint Helena">Saint Helena</option><option value="Saint Kitts And Nevis">Saint Kitts And Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Pierre And Miquelon">Saint Pierre And Miquelon</option><option value="Saint Vincent And The Grenadines">Saint Vincent And The Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome And Principe">Sao Tome And Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia And The South Sandwich Islands">South Georgia And The South Sandwich Islands</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan">Sudan</option><option value="Suriname">Suriname</option><option value="Svalbard And Jan Mayen">Svalbard And Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syrian Arab Republic">Syrian Arab Republic</option><option value="Taiwan">Taiwan</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania">Tanzania</option><option value="Thailand">Thailand</option><option value="Timor-leste">Timor-leste</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad And Tobago">Trinidad And Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks And Caicos Islands">Turks And Caicos Islands</option><option value="Tuvalu">Tuvalu</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates">United Arab Emirates</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Venezuela">Venezuela</option><option value="Viet Nam">Viet Nam</option><option value="British Virgin Islands">British Virgin Islands</option><option value="U.S. Virgin Islands">U.S. Virgin Islands</option><option value="Wallis And Futuna">Wallis And Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option>
            </select><br><br>


        <label for="country_now">In what country have you spent most of the past five years?</label>
            <select id="country_now"name="country_now"><option value=" "> </option><option value="Afghanistan">Afghanistan</option><option value="Aland Islands">Aland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua And Barbuda">Antigua And Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas">Bahamas</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia">Bolivia</option><option value="Bosnia And Herzegovina">Bosnia And Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory">British Indian Ocean Territory</option><option value="Brunei Darussalam">Brunei Darussalam</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cape Verde">Cape Verde</option><option value="Cayman Islands">Cayman Islands</option><option value="Central African Republic">Central African Republic</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option><option value="Colombia">Colombia</option><option value="Comoros">Comoros</option><option value="Congo">Congo</option><option value="The Democratic Republic Of The Congo">The Democratic Republic Of The Congo</option><option value="Cook Islands">Cook Islands</option><option value="Costa Rica">Costa Rica</option><option value="Cote Divoire">Cote Divoire</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Cyprus">Cyprus</option><option value="Czech Republic">Czech Republic</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic">Dominican Republic</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option><option value="Faroe Islands">Faroe Islands</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories">French Southern Territories</option><option value="Gabon">Gabon</option><option value="Gambia">Gambia</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-bissau">Guinea-bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island And Mcdonald Islands">Heard Island And Mcdonald Islands</option><option value="Holy See (Vatican City State)">Holy See (Vatican City State)</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran">Iran</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle Of Man">Isle Of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Democratic Peoples Republic of Korea">Democratic Peoples Republic of Korea</option><option value="Republic of Korea">Republic of Korea</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Lao Peoples Democratic Republic">Lao Peoples Democratic Republic</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia">Macedonia</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands">Marshall Islands</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia">Micronesia</option><option value="Republic of Moldova">Republic of Moldova</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="Netherlands Antilles">Netherlands Antilles</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger">Niger</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="Northern Mariana Islands">Northern Mariana Islands</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestinian Territory">Palestinian Territory</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines">Philippines</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Reunion">Reunion</option><option value="Romania">Romania</option><option value="Russian Federation">Russian Federation</option><option value="Rwanda">Rwanda</option><option value="Saint Helena">Saint Helena</option><option value="Saint Kitts And Nevis">Saint Kitts And Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Pierre And Miquelon">Saint Pierre And Miquelon</option><option value="Saint Vincent And The Grenadines">Saint Vincent And The Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome And Principe">Sao Tome And Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia And The South Sandwich Islands">South Georgia And The South Sandwich Islands</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan">Sudan</option><option value="Suriname">Suriname</option><option value="Svalbard And Jan Mayen">Svalbard And Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syrian Arab Republic">Syrian Arab Republic</option><option value="Taiwan">Taiwan</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania">Tanzania</option><option value="Thailand">Thailand</option><option value="Timor-leste">Timor-leste</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad And Tobago">Trinidad And Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks And Caicos Islands">Turks And Caicos Islands</option><option value="Tuvalu">Tuvalu</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates">United Arab Emirates</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Venezuela">Venezuela</option><option value="Viet Nam">Viet Nam</option><option value="British Virgin Islands">British Virgin Islands</option><option value="U.S. Virgin Islands">U.S. Virgin Islands</option><option value="Wallis And Futuna">Wallis And Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option></select><br><br>

        <p align="right">
            <button id="demographics_button" type="submit" class="btn btn-primary btn-lg">
                Submit <span class="material-icons">navigate_next</span>
            </button>
        </p>
    </form>


    <script>
        // asynchronously submit values of the demographics_form to the server without loading a new page
        // you do not really need to touch anything here
        $(function() {
            $("#demographics_form").ajaxForm({
                success: function (data) {
                    // server will return the participantID
                    participantID = parseInt(data.trim());
                    // update all forms that rely on participant_id (some other forms will have participant_id as a hidden variable)
                    $('input[name=participant_id]').val(participantID);
                    // if participantID needs to be shown anywhere in the HTML, update all tags of class participantID
                    $('.participantID').html(participantID);
                    // the social media sharing buttons
                    if (typeof share !== 'undefined' && share)
                        share.participantID = participantID;
                    // link session to participantID
                    if (typeof sessionFlow !== 'undefined' && sessionFlow)
                        sessionFlow.setParticipantID(participantID);
                    if (debug)
                        console.log("received response from the server for demographics: " + data);
                }
            })
        })
    </script>
</div><!-- end of demographics_page -->


<!-- ********************* INSTRUCTIONS PAGE *********************** -->
<div id="instructions_page" class="page w800">
    <div class="separator2"></div>


    <h1>Instructions</h1>
    <p>In this study, each question asks you to identify errors of different models 
    trained on different datasets. All of these models have at least one model error. 
    The following is a list of visualizations that you will see for all models. Please
    read all instructions before proceeding.</p>

    <!-- TODO instructions for your experiment go here -->
    <img src="./images/tutorials/image1.png" width="100%">
    <p>This graph shows a low-dimensional projection of the data colored by the true class label of each data point.  A model trained on this dataset will generally perform well if there is a simple line that can be drawn to separate points from the 2 classes.  
The horizontal axis corresponds to the first dimension of the projection, and the vertical axis corresponds to the second dimension of the projection.  Each data point corresponds to a data point in the dataset used to train and test the model projected into this 2 dimensional space.  Blue points have class label 0 and orange points have class label 1.
</p>

    <img src="./images/tutorials/image2.png" width="100%">
    <p>This graph shows the confusion matrix, which highlights how 
    points are being mis-classified. A good model makes mostly correct 
    predictions, which are shown as large numbers and deep red squares
    on the main diagonal like in the figure above, while a bad model
    will also have larger numbers on any or all of the off-diagonal
    squares.  This visualization can also show problems related to class
    imbalance if most errors are coming from mis-classifying one specific
    class. In this visualization, the vertical axis corresponds to the
    class predicted by the model, and the horizontal axis corresponds
    to the true class.  The number of each square and the intensity
    of the red shading correspond to how many errors are made for 
    this particular set of true and predicted class labels.
    </p>

    <img src="./images/tutorials/image3.png" width="100%">
    <p>This visualization shows the distribution of the feature values between train and test sets. A good model should be trained on a dataset that is similar to the data it will be deployed on, so the distributions in the train and test sets should look similar.  
Here, each of the 4 plots corresponds to a feature dimension, the x-axis corresponds to the value of the feature, and the y-axis corresponds to how likely the feature is to take that particular value.  The blue distribution corresponds to the data the model was trained on (the train set) and the orange distribution corresponds to the data the model will be deployed on (the test set).

</p>

    <img src="./images/tutorials/image4.png" width="100%">
    <p>This visualization shows the learning curve as the model 
    trains--i.e. the loss as a function of the number of iterations
     of training. A good model should have low values of the loss 
     --suggesting that it is not underfit, and the model should perform 
    similarly on the data it was trained on (train set) and the data 
    it will be deployed on (test set)--suggesting that it is not 
    overfit to the train set. The y-axis shows the loss--lower is better,
    the x-axis shows the training iteration, and the blue and orange 
    lines correspond to the train and test sets respectively.
    </p>

    <p align="right"><button class="btn btn-primary btn-lg" id="instructions_button">
            Got it.  Let's start! <span class="material-icons">navigate_next</span>
        </button> </p>
</div>


<!-- ********************* EXPERIMENT PAGE *********************** -->
<div id="experiment_page" class="page w800">
    <div class="separator2"></div>

    <!-- TODO this is entirely yours to fill out, but here is an example of a survey page -->


    <?php
    // see utils/survey/survey.php for more details about the API
    $nfcSurvey = (new Survey("nfc_survey", 0.1))
        ->addItem((new SurveyPage("Please tell us about yourself", "", "", "", "nfc_page"))
            ->addItem(new ScaleItem("I would prefer complex to simple problems", "", "NFC", "nfc", "nfc1", "Strongly disagree", "Strongly agree"))
            ->addItem(new ScaleItem("I find satisfaction in deliberating hard and for long hours", "", "NFC", "nfc", "nfc6", "Strongly disagree", "Strongly agree"))
            ->addItem(new ScaleItem("Thinking is not my idea of fun", "", "NFC", "nfc", "nfc3", "Strongly disagree", "Strongly agree",
                ["reverseCoded" => true]))
            ->addItem(new ScaleItem("I would rather do something that requires little thought than something that is sure to challenge my thinking abilities", "", "NFC", "nfc", "nfc4", "Strongly disagree", "Strongly agree",
                ["reverseCoded" => true]))
        )
        ->render();
    ?>


</div>
<!-- ********************* EXPERIMENT PAGE 2 *********************** -->
<div id="experiment_page2" class="page w800">
    <div class="separator2"></div>


    <!-- TODO this is entirely yours to fill out, but here is an example of a survey page -->
    <h4>Can you figure out the model error according to the following visualizations? You can only view a visualization about the model once. Therefore think about what's the most important vis to you in this task!</h4>
    <h3><span id='numQ'>0</span>/4 Questions</h3>
    <form name="demo" id="actual_test" action="task.php" method="POST">

        <input type="hidden" name="participant_id" />
        <div id="modelError">        
            <label for="error">What's the mode error?</label>
            <select id="error" name="error" >
                <option value=" "> </option>
                <option value="0">Out of Distribution</option>
                <option value="1">Overfitting</option>
                <option value="2">Underfitting</option>
                <option value="3">Class Imbalance</option>
            </select>
            <b>(important)</b>
            <br><br>
        </div>


        <p>How confident are you?</p>
        <select name="confidence" id="confidence">
            <option value=" "></option>
            <option value="1">Completely confident</option>
            <option value="2">Fairly confident</option>
            <option value="3">Somewhat confident</option>
            <option value="4">Fairly confident</option>
            <option value="5">Completely confident</option>
        </select>

        <input type="hidden" name="time" id="time" />
        <input type="hidden" name="sequence" id="sequence" />

        <p align="right" id="submitButton">
            <button id="experiment_button" type="submit" class="btn btn-primary btn-lg">
                Submit <span class="material-icons">navigate_next</span>
            </button>
        </p>
    </form>

    <div class="w3-container container" id="listOfVis">
        <h2>List of visualizations</h2>

        <button id="bt1" class="w3-button w3-black vis">Learning Curve</button>
        <button id="bt2" class="w3-button w3-black vis">PCA</button>
        <button id="bt3" class="w3-button w3-black vis">Confusion Matrix</button>
        <button id="bt4" class="w3-button w3-black vis">Feature Importance</button>
        <button id="bt5" class="w3-button w3-black vis">Data Distribution</button>

        <div id="id01" class="w3-modal w3-animate-opacity">
            <div class="w3-modal-content w3-card-4">
            <header class="w3-container w3-teal"> 
                <span onclick="document.getElementById('id01').style.display='none'" 
                class="w3-button w3-large w3-display-topright">&times;</span>
                <h2>vis</h2>
            </header>
            <div id="d3Vis">
                
            </div>
            <footer class="w3-container w3-teal">
                <p></p>
            </footer>
            </div>
        </div>
    </div>
</div>
<script>
        $(function() {
            $("#actual_test").ajaxForm({
                success: function (data) {
                    console.log("received response from the server for demographics: " + data);

                    document.getElementById("actual_test").reset();
                    $('input[name=participant_id]').val(participantID);
                }
            })
        })
    </script>

<!-- ********************* COMMENTS PAGE *********************** -->
<div id="comments_page" class="page w800">
    <div class="separator2"></div>

 
    <h1> Thank you for your participation! </h1>
    <p> Before we continue to the results, please answer the following two questions: </p>

    <form id="comments_form" action="comments.php" method="POST">
        <!-- this hidden input allows us to link comments to a specific participant -->
        <input type="hidden" name="participant_id" />

        <label>Did you encounter any technical difficulties or interruptions during this study? &nbsp;
            <input type="radio" name="tech" id="tech_yes" value="1">
            <label for="tech_yes">Yes</label>
            <input type="radio" name="tech" id="tech_no" value="0">
            <label for="tech_no">No</label>
        </label>

        <textarea class="form-control comments_box" id="technical" name="technical" cols="80" rows="4"
                  style="display:none;" placeholder="Please tell us more"></textarea><br/>

        <label>Did you cheat or in any way provide false information? If yes, how? &nbsp;
            <input type="radio" name="cheat" id="cheat_yes" value="1">
            <label for="cheat_yes">Yes</label>
            <input type="radio" name="cheat" id="cheat_no" value="0">
            <label for="cheat_no">No</label>
        </label>

        <textarea class="form-control comments_box" id="cheating" name="cheating" cols="80" rows="4"
                  style="display:none;" placeholder="Please tell us more"></textarea><br/>

        <label for="general">Do you have any comments for the researcher? Questions, Suggestions, or Concerns?</label>
                <textarea class="form-control comments_box" id="general" name="general" cols="80" rows="4" style="margin: auto;"></textarea>
        <br/>

        <p align="right"><button class="btn btn-primary btn-lg" id="comments_button">
                Done! <span class="material-icons">navigate_next</span>
            </button> </p>
    </form><br>

    <script>
        // submit the response asynchronously
        $(function() {
            $("#comments_form").ajaxForm();
        });
        // show/hide comment boxes
        $("input[name='tech']").change(function() {
            if ($('input[name=tech]:checked').val() == '1')
                $('#technical').show();
            else
                $('#technical').hide();
        });
        $("input[name='cheat']").change(function() {
            if ($('input[name=cheat]:checked').val() == '1')
                $('#cheating').show();
            else
                $('#cheating').hide();
        });
    </script>
</div>


<!-- ********************* RESULTS PAGE *********************** -->
<div id="results_page" class="page w800">
    <div class="header">
        <img src="https://www.labinthewild.org/studies/common/img/logo.png" alt="logo" class="logo">
        <span class="share_text">Tell your friends about this test!</span>
        <div class="share_this">
        </div>
        <div class="separator"> &nbsp; </div>
    </div>

    <h1>Thank you!</h1>
    <p></p>

    <!-- TODO this is entirely yours to fill out -->


    <h2>Enjoyed this study?</h2>
    <p>If so...</p>
    <p><b>1.</b> You can <a href="https://www.facebook.com/LabInTheWild" target="_new" class="sessionFlow" id="link_to_litw_fb_page">follow us on Facebook</a> to see results of our studies and to be among the first to hear about new tests.</p>


    <div><b>2.</b> Please tell your friends about this test
    <div class="share_this" id="shareInResults" style="clear:left; float: none;"></div>
    </div>

    <p>
        <b>3.</b> And check out <a href="https://www.labinthewild.org/" target="_new" class="sessionFlow" id="link_to_litw_main_page">LabintheWild</a> for more test!
    </p>
    <div>
        <div class="media ">
            <div class="media-left">
                <a href="http://multitasking.labinthewild.org/multitasking/" target="_new" class="sessionFlow LITWreferral" id="imageLinkToMultitaskingTest">
                    <img src="http://multitasking.labinthewild.org/multitasking/images/multitasking-thumb.png" width="100px" alt="" align="left"/>
                </a>
            </div>
            <div class="media-body">
                <a href="http://multitasking.labinthewild.org/multitasking/" target="_new"
                   class="sessionFlow LITWreferral"
                   id="titleLinkToMultitaskingTest">
                    <b id="multitaskingTestHead">Multitasking Test</b>
                </a>
                <br/>
                <p>How well can you multitask? Compare yourself to others by taking this test!
                    <br/><small>The test typically takes 10 minutes.</small>
                    <a href="http://multitasking.labinthewild.org/multitasking/" target="_new"
                       class="sessionFlow LITWreferral"
                       id="buttonLinkToMultitaskingTest"><b>Try it!</b></a></p>
            </div>
        </div>
    </div>


</div>

<!-- google analytics -->
<script>
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-32982292-1', 'auto');
    ga('send', 'pageview');

</script>

</body>
</html>