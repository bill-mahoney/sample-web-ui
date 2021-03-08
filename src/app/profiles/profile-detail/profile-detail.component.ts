/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { finalize } from 'rxjs/operators'
import { ConfigsService } from 'src/app/configs/configs.service'
import Constants from 'src/app/shared/config/Constants'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { CIRAConfig } from 'src/models/models'
import { ProfilesService } from '../profiles.service'

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit {
  public profileForm: FormGroup
  public activationModes = [{ display: 'Admin Control Mode', value: Constants.ACMActivate }, { display: 'Client Control Mode', value: Constants.CCMActivate }]
  public ciraConfigurations: CIRAConfig[] = []
  public isLoading = false
  public pageTitle = 'New Profile'
  public isEdit = false
  constructor (public snackBar: MatSnackBar, public fb: FormBuilder, public router: Router, private readonly activeRoute: ActivatedRoute,
    public profilesService: ProfilesService, private readonly configsService: ConfigsService) {
    this.profileForm = fb.group({
      profileName: [null, Validators.required],
      activation: [this.activationModes[0].value, Validators.required],
      amtPassword: [null, Validators.required],
      generateRandomPassword: [false, Validators.required],
      generateRandomMEBxPassword: [false, Validators.required],
      mebxPasswordLength: [{ value: null, disabled: true }, [Validators.max(32), Validators.min(8)]],
      passwordLength: [{ value: null, disabled: true }, [Validators.max(32), Validators.min(8)]],
      mebxPassword: [null, Validators.required],
      networkConfigName: [null],
      ciraConfigName: [null]
    })
  }

  ngOnInit (): void {
    this.activeRoute.params.subscribe(params => {
      if (params.name != null && params.name !== '') {
        this.isLoading = true
        this.profilesService.getRecord(params.name).pipe(
          finalize(() => {
            this.isLoading = false
          })).subscribe(data => {
          this.isEdit = true
          this.profileForm.controls.profileName.disable()
          this.pageTitle = data.profileName
          this.profileForm.patchValue(data)
        },
        error => {
          this.snackBar.open($localize`${error.error.message}`, undefined, SnackbarDefaults.defaultError)
          return throwError(error)
        })
      }
    })

    this.configsService.getData().subscribe(data => {
      this.ciraConfigurations = data
    }, error => {
      this.snackBar.open($localize`${error.error.message}`, undefined, SnackbarDefaults.defaultError)
      return of([])
    })

    this.profileForm.controls.generateRandomPassword?.valueChanges.subscribe(value => this.generateRandomPasswordChange(value))
    this.profileForm.controls.generateRandomMEBxPassword?.valueChanges.subscribe(value => this.generateRandomMEBxPasswordChange(value))
  }

  generateRandomPasswordChange (value: boolean): void {
    console.log(value)
    if (value) {
      this.profileForm.controls.amtPassword.disable()
      this.profileForm.controls.amtPassword.clearValidators()
      this.profileForm.controls.passwordLength.setValidators([Validators.max(32), Validators.min(8)])
      this.profileForm.controls.passwordLength.enable()
    } else {
      this.profileForm.controls.amtPassword.enable()
      this.profileForm.controls.amtPassword.setValidators(Validators.required)
      this.profileForm.controls.passwordLength.disable()
      this.profileForm.controls.passwordLength.clearValidators()
    }
  }

  generateRandomMEBxPasswordChange (value: boolean): void {
    console.log(value)
    if (value) {
      this.profileForm.controls.mebxPassword.disable()
      this.profileForm.controls.mebxPassword.clearValidators()
      this.profileForm.controls.mebxPasswordLength.setValidators([Validators.max(32), Validators.min(8)])
      this.profileForm.controls.mebxPasswordLength.enable()
    } else {
      this.profileForm.controls.mebxPassword.enable()
      this.profileForm.controls.mebxPassword.setValidators(Validators.required)
      this.profileForm.controls.mebxPasswordLength.disable()
      this.profileForm.controls.mebxPasswordLength.clearValidators()
    }
  }

  async cancel (): Promise<void> {
    await this.router.navigate(['/profiles'])
  }

  onSubmit (): void {
    if (this.profileForm.valid) {
      this.isLoading = true
      const result: any = Object.assign({}, this.profileForm.getRawValue())
      let request
      let reqType: string
      if (this.isEdit) {
        request = this.profilesService.update(result)
        reqType = 'updated'
      } else {
        request = this.profilesService.create(result)
        reqType = 'created'
      }
      request.pipe(
        finalize(() => {
          this.isLoading = false
        }))
        .subscribe(data => {
          this.snackBar.open($localize`Profile ${reqType} successfully`, undefined, SnackbarDefaults.defaultSuccess)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.router.navigate(['/profiles'])
        },
        error => {
          this.snackBar.open($localize`${error.error.message}`, undefined, SnackbarDefaults.defaultError)
          return throwError(error)
        })
    }
  }
}
