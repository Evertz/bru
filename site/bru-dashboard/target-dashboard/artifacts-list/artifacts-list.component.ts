import { ChangeDetectionStrategy, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { BruService } from '../../../services/bru.service';
import { extractTarget } from '../target-dashboard-utils';
import { FileSet, Invocation, OutputFile, Target } from '../../../../types/invocation-ref';
import { ConfigService } from '../../../services/config.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'href'
})
export class HrefPipe implements PipeTransform {
  constructor(private readonly config: ConfigService) {}

  transform(value: OutputFile, ...args: any[]): string {
    const parts = value.name.split('/');
    return `http://${this.config.getHost()}:3001${value.location}/${parts[parts.length - 1]}`;
  }
}

@Component({
  selector: 'bru-artifacts-list',
  templateUrl: './artifacts-list.component.html',
  styleUrls: ['./artifacts-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtifactsListComponent implements OnInit {
  target$: Observable<Target>;
  files$: Observable<FileSet>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bru: BruService) {}

  ngOnInit(): void {
    this.target$ = extractTarget(this.route, this.bru);
    this.files$ = this.target$
      .pipe(map(target => this.unwrapFilesets(target)));
  }

  private unwrapFilesets(target: Target): FileSet {
    const invocationId = this.route.parent.parent.snapshot.paramMap.get(BruService.INVOCATION_URL_PARAM);
    const invocation = this.bru.registerForInvocation(invocationId);

    const outputs = target.outputs;
    const fileSet: FileSet = {};

    if (outputs) {
      Object.keys(outputs).forEach(group => {
        const files = outputs[group].files ?? [];
        const refs = outputs[group].refs;

        const allFiles = files.concat(
          refs.map(ref => this.findAllFilesForInitialSet(ref, invocation)).flat(1)
        );

        fileSet[group] = { files: allFiles }
      });
    }

    return fileSet;
  }

  private findAllFilesForInitialSet(id: string, invocation: Invocation, files: OutputFile[] = []): OutputFile[] {
    const fileSet = invocation.ref.fileSets[id];
    if (fileSet) {
      files = files.concat(fileSet.files);
      if (fileSet.refs?.length) {
        fileSet.refs.forEach(ref => this.findAllFilesForInitialSet(ref, invocation, files));
      }
    }

    return files;
  }
}

