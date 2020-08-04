#!/usr/bin/env zsh

readonly INPUT_DIR="$1"
readonly NAME="$2"

readonly BASE="./${INPUT_DIR}/${NAME}"

echo "Creating new component and module ${NAME} in ${BASE}"

mkdir -p "${BASE}"
touch "${BASE}/${NAME}.component.ts"
touch "${BASE}/${NAME}.component.html"
touch "${BASE}/${NAME}.component.scss"
touch "${BASE}/_${NAME}.theme.scss"
touch "${BASE}/${NAME}.module.ts"

cat <<< "import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bru-${NAME}',
  templateUrl: './${NAME}.component.html',
  styleUrls: ['./${NAME}.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class __ {

}
" > "${BASE}/${NAME}.component.ts"

cat <<< "import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {  } from './${NAME}.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [

  ]
})
export class __ {}
" > "${BASE}/${NAME}.module.ts"

cat <<< "@mixin app-test-log-view(\$theme) {
  \$background: map-get(\$theme, background);
  \$foreground: map-get(\$theme, foreground);
  \$primary: map-get(\$theme, primary);
  \$warn: map-get(\$theme, warn);

}
" > "${BASE}/_${NAME}.theme.scss"

bzlgen ng_bundle "${BASE}"
