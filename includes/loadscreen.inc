<div class="m-app-loading">
    <!--
            HACKY CODE WARNING: I'm putting Style block inside directive so that it 
            will be removed from the DOM when we remove the directive container.
    -->
    <style type="text/css">
        div.m-app-loading {
            position: fixed;
            z-index: 9999;
        }
        div.m-app-loading div.background{
            background-color: #000;
            opacity: 0.5;
            position: fixed;
            bottom: 0px;
            left: 0px;
            right: 0px;
            top: 0px;
        }
        div.m-app-loading div.animated-container {
            position: fixed;
            bottom: 0px;
            left: 0px;
            right: 0px;
            top: 0px;
        }
        div.m-app-loading div.progress-frame {
            margin: 30px auto;
            position: relative;
            text-align: center;
            width: 300px;
            right: 0px;
        }

    </style>
    <!-- BEGIN: Actual animated container. -->
    <div class="background" data-backdrop="static"></div>
    <div class="animated-container">
        <div class="progress-frame">
            <div class="modal-content modal-body">
                <p class="text-center">Seite wird geladen...</p>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped active" style="width: 100%"></div>
                </div>
            </div>
        </div>
    </div>
    <!-- END: Actual animated container. -->
</div>